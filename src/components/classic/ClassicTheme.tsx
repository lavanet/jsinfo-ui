// src/components/classic/ClassicTheme.tsx

import { Theme } from "@radix-ui/themes";

interface ClassicThemeProps { }

const ClassicTheme: React.FC<React.PropsWithChildren<ClassicThemeProps>> = ({ children }) => {
    return (
        <Theme
            appearance="dark"
            accentColor="tomato"
            grayColor="slate"
            panelBackground="solid"
            radius="full"
            style={{
                position: "unset",
                minHeight: "unset",
                zIndex: "unset",
            }}
        >
            {children}
        </Theme>
    );
};

export default ClassicTheme;