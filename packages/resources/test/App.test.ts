import {
  expect as expectCdk,
  haveResource,
  ResourcePart,
} from "@aws-cdk/assert";
import { App, AppDeployProps, Auth, DeployProps, Stack } from "../src";
import { RemovalPolicy } from "@aws-cdk/core";
import { Bucket } from "@aws-cdk/aws-s3";

test("non-namespaced-props", async () => {
  const deployProps = {} as DeployProps;
  expect(deployProps).toBeDefined();
});

test("namespaced-props", async () => {
  const deployProps = {} as AppDeployProps;
  expect(deployProps).toBeDefined();
});

test("defaultRemovalPolicy", () => {
  const app = new App();
  app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY);
  const stack = new Stack(app, "stack");
  new Auth(stack, "Auth", { cognito: true });
  expectCdk(stack).to(
    haveResource(
      "AWS::Cognito::UserPool",
      {
        DeletionPolicy: "Delete",
      },
      ResourcePart.CompleteDefinition
    )
  );
});

test("defaultRemovalPolicy bucket", () => {
  const app = new App();
  app.setDefaultRemovalPolicy(RemovalPolicy.DESTROY);
  const stack = new Stack(app, "stack");
  new Bucket(stack, "Bucket");
  expectCdk(stack).to(haveResource("Custom::S3AutoDeleteObjects", {}));
});

test("stackName is default", () => {
  const app = new App();
  const stack = new Stack(app, "stack");
  expect(stack.stackName).toBe("dev-my-app-stack");
  expect(() => {
    app.synth();
  }).not.toThrow();
});

test("stackName is parameterized", () => {
  const app = new App();
  const stack = new Stack(app, "stack", {
    stackName: "my-app-dev-stack",
  });
  expect(stack.stackName).toBe("my-app-dev-stack");
  expect(() => {
    app.synth();
  }).not.toThrow();
});

test("stackName is not parameterized", () => {
  const app = new App();
  new Stack(app, "stack", {
    stackName: "my-stack",
  });
  expect(() => {
    app.synth();
  }).toThrow(
    /Stack "my-stack" is not parameterized with the stage name. The stack name needs to either start with "\$stage-", end in "-\$stage", or contain the stage name "-\$stage-"./
  );
});
