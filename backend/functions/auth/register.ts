/**
 * POST /auth/register
 * Public endpoint — no auth required.
 * Body: { email, password, name, dateOfBirth }
 */
import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { z } from 'zod';
import { ok, err } from '../../shared/types';

const cognito = new CognitoIdentityProviderClient({ region: process.env.REGION });

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(50),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = RegisterSchema.safeParse(JSON.parse(event.body ?? '{}'));
    if (!body.success) {
      return { statusCode: 400, body: JSON.stringify(err(body.error.errors[0]?.message ?? 'Invalid input')) };
    }

    const { email, password, name, dateOfBirth } = body.data;

    const result = await cognito.send(new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'given_name', Value: name },
        { Name: 'birthdate', Value: dateOfBirth },
      ],
    }));

    // TODO Sprint 1: Seed user row in Aurora via Data API

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ok({ userId: result.UserSub, message: 'Verification email sent' })),
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Registration failed';
    console.error('register error:', e);
    return { statusCode: 500, body: JSON.stringify(err(message)) };
  }
};
