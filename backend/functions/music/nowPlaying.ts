import { APIGatewayProxyHandler } from "aws-lambda";
import { ok, err } from "../../shared/types";

export const handler: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 501,
    body: JSON.stringify(err("Not implemented")),
  };
};
