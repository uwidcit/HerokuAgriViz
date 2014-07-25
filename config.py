from authomatic.providers import oauth1, oauth2, openid

CONFIG = {
    
    'google': {
            
            'class_': oauth2.Google,
            'consumer_key': '478264315891-7s434mf1e3c9b3d8310tdldo83rutopq.apps.googleusercontent.com',
            'consumer_secret': 'uUebrBW9cXp2_KMQCZG6h75K',
            'scope': oauth2.Google.user_info_scope
        }

    
    }