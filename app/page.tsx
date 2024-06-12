import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
    return (
        <div>
            <Link href="/admin">
                <Button>Go to Admin Page</Button>
            </Link>
            <Link href="/upload">
                <Button>Go to Upload Page</Button>
            </Link>
        </div>
    );
};

export default HomePage;