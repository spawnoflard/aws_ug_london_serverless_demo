#
# Sample Start Button Pipeline API Call
#
# @heitor_lessa

import json
import requests

state_machine_arn = "arn:aws:states:eu-west-1:848715237199:stateMachine:StepFunctionStateMachine-ZG8ZKTCAAFJM"
api_url = "https://amj0leojkh.execute-api.eu-west-1.amazonaws.com/dev/startpipeline"

input_event = {
    "notifier": "Slack",
    "pipeline_name": "RestaurantService_pipeline",
    "channel": "general",
    "slack_token": "xoxp-5113909253-5113909265-13653434482-084ac8293e",
    "message": "Deployment pipeline triggered successfuly"
}


data = {
     "input": json.dumps(input_event),
     "name": "Demo-Staged",
     "stateMachineArn": state_machine_arn
}

ret = requests.post(api_url, data=json.dumps(data))
if "OK" in ret.reason:
    print(ret.text)