import * as React from "react"
import { cn } from "@jsinfo/lib/css"
import { GetInfoNetwork } from "@jsinfo/lib/env"

interface NetworkSwitchProps extends React.HTMLAttributes<HTMLDivElement> { }

export const NetworkSwitch = React.forwardRef<HTMLDivElement, NetworkSwitchProps>(
    ({ className, ...props }, ref) => {
        const isMainnet = GetInfoNetwork().toLowerCase() === 'mainnet';

        const handleNetworkSwitch = () => {
            if (!isMainnet) {
                window.location.href = 'https://info-mainnet.lavanet.xyz';
            } else {
                window.location.href = 'https://info.lavanet.xyz';
            }
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center gap-1 rounded-full p-1 bg-muted cursor-pointer",
                    "hover:bg-muted/80 transition-all duration-300 ease-in-out",
                    "hover:shadow-md",
                    className
                )}
                onClick={handleNetworkSwitch}
                {...props}
            >
                <div
                    className={cn(
                        "px-3 py-1 rounded-full text-sm",
                        isMainnet
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
                    )}
                >
                    Mainnet
                </div>
                <div
                    className={cn(
                        "px-3 py-1 rounded-full text-sm",
                        !isMainnet
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105"
                    )}
                >
                    Testnet
                </div>
            </div>
        )
    }
)
NetworkSwitch.displayName = "NetworkSwitch"