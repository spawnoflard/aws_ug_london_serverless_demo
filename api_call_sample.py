#
# Sample Start Button Pipeline API Call
#
# @heitor_lessa

import json
import requests

state_machine_arn = ""
api_url = ""

input_event = {
    "notifier": "Slack",
    "pipeline_name": "RestaurantService_pipeline",
    "channel": "general",
    "slack_token": "xoxp-xxxxx",
    "message": "Deployment pipeline triggered successfuly"
}


data = {
     "input": json.dumps(input_event),
     "name": "Demo-APIGW-StepFunctions-Integration",
     "stateMachineArn": state_machine_arn
}

ret = requests.post(api_url, data=json.dumps(data))
if "OK" in ret.reason:
    print(ret.text)