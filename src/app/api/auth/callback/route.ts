import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const afterCallback = async (req: NextApiRequest, res: NextApiResponse, session: any, state: any) => {
    const user = session.user;
    let existingUser = await prisma.users.findUnique({
        where: { email: user.email },
    });

    if (!existingUser) {
        existingUser = await prisma.users.create({
            data: {
                email: user.email,
                name: user.name,
                password: user.password
            },
        });
    }

    return session;
};

export default handleAuth({
    async callback(req: NextApiRequest, res: NextApiResponse) {
        try {
            await handleCallback(req, res, { afterCallback });
        } catch (error: any) {
            res.status(error.status || 500).end(error.message);
        }
    },
});
