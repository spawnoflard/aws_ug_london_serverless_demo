#
# Simplest Slack Notifier to a particular channel 
# Legacy Token Generation: https://api.slack.com/custom-integrations/legacy-tokens
# 
# Look up for "slack-echo-command-python"" blueprint while creating a Lambda function via Console for a "slash_command" sample
#
# @heitor_lessa

from slacker import Slacker

def lambda_handler(event, context):
    # These Keys come from StepFunction State Machine execution (look at call_api.py)
    channel = event["channel"]  
    token   = event["slack_token"] # ideally encrypted and KMS to decrypt afterwards
    message = event["message"] 
    slack   = Slacker(token)

    # Send a message to #general channel
    ret = slack.chat.post_message(channel, message)
    if ret.successful:
        return True
    