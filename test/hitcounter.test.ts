import { Template, Capture } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { HitCounter } from "../lib/hitcounter";

describe("Some unit tests", () => {
  test("DynamoDB Table Created", () => {
    const stack = new cdk.Stack();

    new HitCounter(stack, "MyTestConstruct", {
      downstream: new lambda.Function(stack, "TestFunction", {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "hello.handler",
        code: lambda.Code.fromAsset("lambda"),
      }),
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::DynamoDB::Table", 1);
  });

  test("Lambda has correct environment variables", () => {
    const stack = new cdk.Stack();

    new HitCounter(stack, "MyTestConstruct", {
      downstream: new lambda.Function(stack, "TestFunction", {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "hello.handler",
        code: lambda.Code.fromAsset("lambda"),
      }),
    });

    const template = Template.fromStack(stack);
    const envCapture = new Capture();

    template.resourceCountIs("AWS::Lambda::Function", 2);
    template.hasResourceProperties("AWS::Lambda::Function", {
      Environment: envCapture,
    });

    expect(envCapture.asObject()).toEqual({
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: {
          Ref: "TestFunction22AD90FC",
        },
        HITS_TABLE_NAME: {
          Ref: "MyTestConstructHits24A357F0",
        },
      },
    });
  });

  test("DynamoDB table is created with encryption", () => {
    const stack = new cdk.Stack();

    new HitCounter(stack, "MyTestConstruct", {
      downstream: new lambda.Function(stack, "TestFunction", {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("lambda"),
        handler: "hello.handler",
      }),
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      SSESpecification: {
        SSEEnabled: true,
      },
    });
  });

  test("throws an error when an invalid readCapacity is being provided", () => {
    const stack = new cdk.Stack();

    expect(() => {
      new HitCounter(stack, "MyTestConstruct", {
        readCapacity: 50,
        downstream: new lambda.Function(stack, "TestFunction", {
          runtime: lambda.Runtime.NODEJS_18_X,
          code: lambda.Code.fromAsset("lambda"),
          handler: "hello.handler",
        }),
      });
    }).toThrowError(
      "read capacity for Dynamo must be greater than 5 and less than 20"
    );
  });
});
