// src/components/Navbar.tsx

import Link from 'next/link';
import { Button, Card } from '@radix-ui/themes';
import { NavbarSearch } from './NavbarSearch';

export function Navbar() {
    return (
        <Card className="relative flex justify-between overflow-visible h-[50px]" style={{ contain: "none", overflow: "visible" }}>
            <div id="NavBarButtons" className="flex gap-3">
                <Link href='/'>
                    <Button variant="soft">
                        Index
                    </Button>
                </Link>
                <Link href='/events'>
                    <Button variant="soft">
                        Events
                    </Button>
                </Link>
            </div>
            <div className="absolute right-2 pt-[1px]">
                <NavbarSearch />
            </div>
        </Card>
    )
}
