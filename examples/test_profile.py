import requests

# Step 1: Direct user to this URL
auth_url = (
    "https://www.linkedin.com/oauth/v2/authorization"
    "?response_type=code"
    "&client_id=78h6535gg4puis"
    "&redirect_uri=https://localhost:8001/callback"
    "&scope=r_liteprofile"
)

print(f"Please visit this URL to authorize the application: {auth_url}")    

# Step 2: After user approves, they’re redirected to your redirect_uri with a "code" parameter
# Exchange 'code' for access token
def get_access_token(auth_code):
    token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
    data = {
        'grant_type': 'authorization_code',
        'code': auth_code,
        'redirect_uri': 'https://localhost:8001/callback',
        'client_id': '78h6535gg4puis',
        'client_secret': 'WPL_AP1.5gcW3hRKz068YYYQ.spIJIQ',
    }
    resp = requests.post(token_url, data=data)
    return resp.json()['access_token']
