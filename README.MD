## Purpose

Demo to demonstrate brief intro to Serverless CI/CD and intro to recent API Gateway + Step Functions integration.

Can also be simplified to call API Gateway -> Lambda Proxy -> Lambda function to trigger a pipeline.

Feel free to reach out as I'm happy to explain this in more details if you missed the entire session - v.0.0.1 notes :)

## Demo structure


```bash
├── README.MD
├── RestaurantService_repo                  <-- Restaurants service
│   ├── app-sam.yaml                        <-- SAM template for Restaurant service
│   ├── buildspec.yml                       <-- CodeBuild build spec
│   ├── restaurants-service                 <-- Restaurants service code
│   ├── restaurants-service-tests           <-- Restaurants tests
│   └── test-sam.yaml                       <-- SAM to create tests struct
├── StartPipelineButton                     <-- StartButton service
│   ├── cloudformation
│   │   ├── start-pipeline-button.yaml      <-- SAM for StartButton
│   ├── code
│      ├── slack                            <-- Slack Notifier service
│      └── start_pipeline                   <-- StartButton service
├── api_call_sample.py                      <-- Calls API Gateway sample
├── serverless-pipeline.yaml                <-- SAM to create CI/CD Pipeline
```

## HOWTO:

> This doesn't cover Serverless CI/CD setup
> But all you need is to use cloudformation package/deploy with ``serverless-pipeline.yaml`` to create CI/CD infrastructure
> Clone CodeCommit Repo and push all files underneath ``RestaurantService_repo`` into CodeCommit
> **Don't push the folder ``RestaurantService_repo`` but the files underneath**
> Once pushed it will trigger the pipeline just fine

Everything below only covers the Start Button demo that utilize:

* API Gateway -> Step Functions integration
* SAM to create infrastructure
* Simple API call to this API Gateway using Python Requests

Code available as-is and created mostly for giving an idea on how things are built but this assumes you are well versed with AWS and know how the services below work (in case you get any error):

* Cloudformation
* CodeBuild
* CodeCommit
* API Gateway
* Step Functions
* Lambda
* DynamoDB
* A bit of python ;)


**Before you start**

* Make sure AWS CLI is configured or you can assume a role with Admin privilleges
* Install [GIT](https://git-scm.com/downloads) if you don't have it

**Use AWS CLI to package SAM template**

```bash
aws cloudformation package --template-file cloudformation/step.yaml --output-template-file packaged-template.yaml --s3-bucket <<S3_Bucket_Region_You_Are_Deploying_To>>
```

**Use AWS CLI to deploy SAM template via Cloudformation ChangeSet**

```bash
aws cloudformation deploy --template-file packaged-template.yaml --stack-name <<stack_name>> --parameter-overrides "CodePipelineName"="<<CodePipeline_Name_To_Trigger>>" --capabilities CAPABILITY_IAM
```

**Gather Outputs and update ``api_call_sample.py``**

``bash
aws cloudformation describe-stacks --query 'Stacks[].{Stack:StackName,Status:StackStatus,Output:Outputs}' --stack-name <<stack_name>>
``

You need to do the following before making the API call:

* Grab the following outputs from this call: ``StepFunctionsStateMachine`` and ``StartPipelineUrl``
* Update the following values within ``api_call_sample.py``
    + ``state_machine_arn``
    + ``api_url``
        - Both above were gathered from Cloudformation Outputs
    + ``pipeline_name``
        - Existing CodePipeline Name you want to trigger
    + ``slack_token``
        - Slack Token that is able to send message to channel #general

## FAQ

**Q: I don't yet have a Pipeline to make this any useful - Where can I get one?**

**A:** You can use [Getting Started CI/CD Pipeline](https://aws.amazon.com/getting-started/projects/set-up-ci-cd-pipeline/) or [Serverless Timezone](https://aws.amazon.com/blogs/compute/continuous-deployment-for-serverless-applications/)

**Q: I don't have a physical button, any alternative to use this?**

**A:** You can create a virtual button using [IFTTT Widget Button](https://ifttt.com/do_button) and as an ``Action`` you can use [Maker WebHook](https://ifttt.com/maker_webhooks) to trigger a HTTP POST to the URL given out of cloudformation (API Gateway endpoint).

**Q: I updated the State Machine definition and cloudformation succeeded but I now get Access Denied error. Why is that?**

**A:** Every time a new update happens to a State Machine definition StepFunctions creates a new one and deletes the previous one. That means ARN changes so you need to ensure you're calling the right State Machine to execute.

**Q: I get a return that StepFunctions executed but when I don't see any new executions in there, what's happening?**

**A:** Take a look at the JSON you're calling StepFunctions and ensure the Execution Name is unique every time you call it. Although you get a response every time you call it you will notice that "startDate" doesn't change if the name is always the same in every execution.

**Q: I received the following error and although previous step worked I have no idea why the next doesn't - Any guidance?**

``
error: States.Runtime
cause: An error occurred while executing the state 'NotifierState' (entered at the event id #7). Invalid path: The choice state's condition path references an undefined value.
``

**A:** This error means that StepFunctions is trying to access a variable ($.notifier in this case) to decide what will be the next step, however it found as "undefined value". This can happen if the previous step had overwritten the "input" initially sent. In other words, if the previous step (StartPipeline) returns True instead of return event, this will fail as "Input" now becomes "True" instead of all objects initially passed.

## Next steps

* Add Twilio as a notifier
* Add SNS as a notifier
