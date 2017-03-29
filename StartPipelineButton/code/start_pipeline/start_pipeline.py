#
# Sample Start Button code that trigger CodePipeline
#
# @heitor_lessa


import boto3
import botocore


# Use these Exceptions to practice Step Functions Catch feature
# -> https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-handling-error-conditions.html
class NoPipelineConfiguredException(Exception):
    pass


class PipelineNotFoundOrNotInThisAccountException(Exception):
    pass

pipeline = boto3.client('codepipeline')


def lambda_handler(event, context):
    print(event)
    try:
        pipeline.start_pipeline_execution(
            name=event["pipeline_name"]
        )
        return event
    except KeyError:
        raise NoPipelineConfiguredException(
            "Ensure PIPELINE_NAME is set and pipeline is under this account")
    except botocore.exceptions.ClientError as e:
        if "PipelineNotFoundException" in e.message:
            raise PipelineNotFoundOrNotInThisAccountException(
                "Ensure Pipeline {} exists in your account. Error: {}".format(event["pipeline_name"], e.message))
