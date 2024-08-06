// src/app/provider/[lavaid]/_components/ProviderAccountInfoTab.tsx
import { Tabs } from '@radix-ui/themes';
import dynamic from 'next/dynamic';

/*  adding the dynamic import because of the following error:
⨯ ReferenceError: document is not defined
    at __webpack_require__ (/Users/mikecotic/Documents/lava_projects/jsinfo/src/jsinfo-ui/.next/server/webpack-runtime.js:33:43)
    at eval (./src/app/provider/[lavaid]/_components/ProviderAccountInfoCard.tsx:12:73)
    at (ssr)/./src/app/provider/[lavaid]/_components/ProviderAccountInfoCard.tsx (/Users/mikecotic/Documents/lava_projects/jsinfo/src/jsinfo-ui/.next/server/app/provider/[lavaid]/page.js:272:1)
    at __webpack_require__ (/Users/mikecotic/Documents/lava_projects/jsinfo/src/jsinfo-ui/.next/server/webpack-runtime.js:33:43)
    at eval (./src/app/provider/[lavaid]/_components/ProviderAccountInfoTab.tsx:8:82)
    at (ssr)/./src/app/provider/[lavaid]/_components/ProviderAccountInfoTab.tsx (/Users/mikecotic/Documents/lava_projects/jsinfo/src/jsinfo-ui/.next/server/app/provider/[lavaid]/page.js:283:1)
    at __webpack_require__ (/Users/mikecotic/Documents/lava_projects/jsinfo/src/jsinfo-ui/.next/server/webpack-runtime.js:33:43)
    at eval (./src/app/provider/[lavaid]/page.tsx:29:93)
    at (ssr)/./src/app/provider/[lavaid]/page.tsx (/Users/mikecotic/Documents/lava_projects/jsinfo/src/jsinfo-ui/.next/server/app/provider/[lavaid]/page.js:404:1)
    at Object.__webpack_require__ [as require] (/Users/mikecotic/Documents/lava_projects/jsinfo/src/jsinfo-ui/.next/server/webpack-runtime.js:33:43)
    at JSON.parse (<anonymous>)
digest: "867270476"
*/

const ProviderAccountInfoCard = dynamic(() => import('./ProviderAccountInfoCard'), { ssr: false });
interface ProviderAccountInfoTabProps {
    addr: string;
}

const ProviderAccountInfoTab: React.FC<ProviderAccountInfoTabProps> = ({ addr }) => {
    return (
        <Tabs.Content value={"accountInfo"}>
            <ProviderAccountInfoCard addr={addr} />
        </Tabs.Content>
    )
}
export default ProviderAccountInfoTab;
