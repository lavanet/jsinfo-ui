// src/components/Navbar.tsx

import Link from 'next/link'
import { Button } from '@radix-ui/themes';
import { NavbarSearch } from './NavbarSearch';
import { GetLogoUrl } from '@jsinfo/common/env';

export function Navbar() {
    return (
        <>
            <img src={GetLogoUrl()} alt="Logo" className="mb-2 ml-2" />
            <div className="box-margin-bottom relative flex justify-between overflow-visible h-[40px]" style={{ contain: "none", overflow: "visible", padding: '7px' }}>
                <div id="NavBarButtons" className="flex gap-3">
                    <Link href='/'>
                        <Button id="indexbtn" variant="soft">
                            Index
                        </Button>
                    </Link>
                    <Link href='/events'>
                        <Button id="eventsbtn" variant="soft">
                            Events
                        </Button>
                    </Link>
                </div>
                <div className="absolute right-2">
                    <NavbarSearch />
                </div>
            </div>
        </>
    )
}
