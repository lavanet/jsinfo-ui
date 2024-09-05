import { Theme } from "@radix-ui/themes";

interface LegacyThemeProps { }

const LegacyTheme: React.FC<React.PropsWithChildren<LegacyThemeProps>> = ({ children }) => {
    return (
        <Theme
            appearance="dark"
            accentColor="tomato"
            grayColor="slate"
            panelBackground="solid"
            radius="full"
        >
            {children}
        </Theme>
    );
};

export default LegacyTheme;