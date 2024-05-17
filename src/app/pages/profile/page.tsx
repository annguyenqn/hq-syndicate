import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { PrismaClient, users } from '@prisma/client';
import { useEffect, useState } from 'react';
import { GetServerSideProps, GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();
interface ProfileProps {
    user: users | null;
}

export default function Profile({ user }: ProfileProps) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, [user]);

    if (loading) {
        return <p>Loading...</p>;
    }
    if (!user) {
        return <p>Please log in to view this page</p>;
    }

    return (
        <div className=''>
            <h1>Profile</h1>
            <p>Welcome, {user.name} ({user.email})</p>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<ProfileProps> = withPageAuthRequired({
    async getServerSideProps(context: GetServerSidePropsContext) {
        const { req, res } = context;
        const user = await getSession(req, res);
        console.log('this is user', user);
        let userData: users | null = null;
        if (user) {
            try {
                userData = await prisma.users.findUnique({
                    where: { email: user.email },
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
        return {
            props: { user: userData },
        };
    },
});
