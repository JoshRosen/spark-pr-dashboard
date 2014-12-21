import json
import logging
import urllib
import urlparse

from flask import render_template, redirect, session, make_response, url_for, g, request, abort, \
    Response
from google.appengine.api import urlfetch, users

from sparkprs import app, cache, db
from sparkprs.models import Issue, User
from sparkprs.models2 import JIRAIssue
from sparkprs.github_api import github_request, BASE_AUTH_URL

from sparkprs.controllers.tasks import tasks
from sparkprs.controllers.admin import admin
app.register_blueprint(tasks, url_prefix='/tasks')
app.register_blueprint(admin, url_prefix='/admin')

#  --------- Authentication and admin panel functionality -----------------------------------------#

@app.before_request
def before_request():
    g.user = None
    if 'github_login' in session:
        g.user = User.query(User.github_login == session['github_login']).get()


@app.route('/github-callback')
def github_authorized_callback():
    # This is based loosely on https://github.com/cenkalti/github-flask
    # and http://stackoverflow.com/a/22275563
    if 'code' not in request.args:
        raise Exception("Got error from GitHub")
    next_url = request.args.get('next') or url_for('main')
    payload = {
        'code': request.args.get('code'),
        'client_id': app.config['GITHUB_CLIENT_ID'],
        'client_secret': app.config['GITHUB_CLIENT_SECRET'],
    }
    auth_url = BASE_AUTH_URL + 'access_token'
    logging.info("Auth url is %s" % auth_url)
    response = urlfetch.fetch(auth_url, method=urlfetch.POST, payload=urllib.urlencode(payload),
                              validate_certificate=True)
    if response.status_code != 200:
        raise Exception("Got %i response from GitHub:\n%s" %
                        (response.status_code, response.content))
    data = urlparse.parse_qs(response.content)
    access_token = data.get('access_token', None)
    if access_token is None:
        return redirect(next_url)
    access_token = access_token[0].decode('ascii')
    user_json = json.loads(github_request("user", oauth_token=access_token).content)
    user = User.query(User.github_login == user_json['login']).get()
    if user is None:
        user = User(github_login=user_json['login'])
    user.github_user_json = user_json
    user.github_access_token = access_token
    user.put()

    session['github_login'] = user.github_login
    return redirect(url_for('main'))


@app.route('/login')
def login():
    query = {
        'client_id': app.config['GITHUB_CLIENT_ID'],
        'redirect_uri': app.config['GITHUB_CALLBACK_URL'],
    }
    auth_url = BASE_AUTH_URL + 'authorize?' + urllib.urlencode(query)
    return redirect(auth_url)


@app.route('/logout')
def logout():
    session.pop('github_login', None)
    return redirect(url_for('main'))


@app.route('/appengine-admin-login')
def appengine_admin_login():
    return redirect(users.create_login_url("/"))


@app.route('/appengine-admin-logout')
def appengine_admin_logout():
    return redirect(users.create_logout_url("/"))


@app.route('/user-info')
def user_info():
    """
    Returns JSON describing the currently-signed-in user.
    """
    if g.user:
        user_dict = {
            'github_login': g.user.github_login,
            'roles': g.user.roles,
        }
    else:
        user_dict = None
    return Response(json.dumps(user_dict, indent=2, separators=(',', ': ')),
                    mimetype='application/json')

#  --------- User-facing pages --------------------------------------------------------------------#

def build_response(template, max_age=60):
    rendered = render_template(template)
    response = make_response(rendered)
    response.cache_control.max_age = max_age
    return response


@app.route('/search-open-prs')
@cache.cached(timeout=60)
def search_open_prs():
    prs = Issue.query(Issue.state == "open").order(-Issue.updated_at).fetch()
    json_dicts = []
    for pr in prs:
        last_jenkins_comment_dict = None
        if pr.last_jenkins_comment:
            last_jenkins_comment_dict = {
                'body': pr.last_jenkins_comment['body'],
                'user': {'login': pr.last_jenkins_comment['user']['login']},
                'html_url': pr.last_jenkins_comment['html_url'],
            }
        d = {
            'parsed_title': pr.parsed_title,
            'number': pr.number,
            'updated_at': str(pr.updated_at),
            'user': pr.user,
            'state': pr.state,
            'components': pr.components,
            'lines_added': pr.lines_added,
            'lines_deleted': pr.lines_deleted,
            'lines_changed': pr.lines_changed,
            'is_mergeable': pr.is_mergeable,
            'commenters': [{'username': u, 'data': d} for (u, d) in pr.commenters],
            'last_jenkins_outcome': pr.last_jenkins_outcome,
            'last_jenkins_comment': last_jenkins_comment_dict,
        }
        # Use the first JIRA's information to populate the "Priority" and "Issue Type" columns:
        jiras = pr.parsed_title["jiras"]
        if jiras:
            first_jira = JIRAIssue.query.get("SPARK-%i" % jiras[0])
            if first_jira:
                d['jira_priority_name'] = first_jira.priority_name
                d['jira_priority_icon_url'] = first_jira.priority_icon_url
                d['jira_issuetype_name'] = first_jira.issuetype_name
                d['jira_issuetype_icon_url'] = first_jira.issuetype_icon_url
        json_dicts.append(d)
    response = Response(json.dumps(json_dicts), mimetype='application/json')
    return response


@app.route("/trigger-jenkins/<int:number>", methods=['GET', 'POST'])
def test_pr(number):
    """
    Triggers a parametrized Jenkins build for testing Spark pull requests.
    """
    if not (g.user and g.user.has_capability("jenkins")):
        return abort(403)
    pr = Issue.get_or_create(number)
    commit = pr.pr_json["head"]["sha"]
    # The parameter names here were chosen to match the ones used by Jenkins' GitHub pull request
    # builder plugin: https://wiki.jenkins-ci.org/display/JENKINS/Github+pull+request+builder+plugin
    # In the Spark repo, the https://github.com/apache/spark/blob/master/dev/run-tests-jenkins
    # script reads these variables when posting pull request feedback.
    query = {
        'token': app.config['JENKINS_PRB_TOKEN'],
        'ghprbPullId': number,
        'ghprbActualCommit': commit,
        # This matches the Jenkins plugin's logic; see
        # https://github.com/jenkinsci/ghprb-plugin/blob/master/src/main/java/org/jenkinsci/plugins/ghprb/GhprbTrigger.java#L146
        #
        # It looks like origin/pr/*/merge ref points to the last successful test merge commit that
        # GitHub generates when it checks for mergeability.  This API technically isn't documented,
        # but enough plugins seem to rely on it that it seems unlikely to change anytime soon
        # (if it does, we can always upgrade our tests to perform the merge ourselves).
        #
        # See also: https://developer.github.com/changes/2013-04-25-deprecating-merge-commit-sha/
        'sha1': ("origin/pr/%i/merge" % number) if pr.is_mergeable else commit,
    }
    trigger_url = "%sbuildWithParameters?%s" % (app.config["JENKINS_PRB_JOB_URL"],
                                                urllib.urlencode(query))
    logging.debug("Triggering Jenkins with url %s" % trigger_url)
    response = urlfetch.fetch(trigger_url, method="POST")
    if response.status_code not in (200, 201):
        logging.error("Jenkins responded with status code %i" % response.status_code)
        return response.content
    else:
        return redirect(app.config["JENKINS_PRB_JOB_URL"])


@app.route('/')
@app.route('/open-prs')
@app.route('/users')
@app.route('/users/<username>')
def main(username=None):
    return build_response('index.html')
