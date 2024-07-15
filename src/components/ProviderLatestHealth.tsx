// src/components/providerLatestHealth.tsx

import React from 'react';
import { Card, Text, Box, Link } from "@radix-ui/themes";
import LoadingIndicator from '@jsinfo/components/LoadingIndicator';
import { ErrorDisplay } from '@jsinfo/components/ErrorDisplay';
import TimeTooltip from '@jsinfo/components/TimeTooltip';
import { useApiDataFetch } from '@jsinfo/hooks/useApiDataFetch';
import { RenderInFullPageCard } from '@jsinfo/common/utils';
import StatusCall from './StatusCell';
import Image from 'next/image';
import TextToggle from './TextToggle';

interface InterfaceStatus {
    status: string;
    timestamp: string;
    data: string | null;
}

interface SpecInterfaces {
    [region: string]: InterfaceStatus;
}

interface SpecStatusAndInterfaces {
    overallStatus: string;
    interfaces?: {
        [key: string]: SpecInterfaces;
    }
}
interface HealthSpecRecord {
    spec: string;
    specData: SpecStatusAndInterfaces;
}
interface HealthData {
    provider: string;
    specs: HealthSpecRecord[];
}

interface ProviderLatestHealthCardsProps {
    lavaId: string;
}

let currentNumber = 0;

function hckey(str: string): string {
    currentNumber += 1;
    return `healthcontainer_${currentNumber}_${str}`;
}

const renderInterface = (specStatusAndInterfaces: SpecStatusAndInterfaces, spec: string, intf: string) => {
    const interfaceData = specStatusAndInterfaces.interfaces![intf];
    if (!interfaceData) return null;

    return (
        <Box key={hckey(`${spec}_${intf}_box`)} style={{ marginTop: '-2px', marginBottom: '0px' }}>
            <Image
                key={hckey(`${spec}_${intf}_image`)}
                width={9}
                height={9}
                src="/communication.svg"
                alt="communication"
                style={{ display: 'inline-block', verticalAlign: 'middle', paddingBottom: '0px', marginRight: '3px' }}
            />
            <Text key={hckey(`${spec}_${intf}_text`)} weight="bold" style={{ fontSize: '12px', color: 'grey' }}>{intf}</Text>
            {Object.keys(interfaceData).map(region => {
                const regionData = interfaceData[region];
                const status = regionData.status;
                const timestamp = regionData.timestamp;
                const data = regionData.data;

                if (data) {
                    return (
                        <div key={hckey(`${spec}_${intf}_div`)} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                            <div key={hckey(`${spec}_${intf}_div`)} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <Text key={hckey(`${spec}_${intf}_text`)} style={{ marginRight: '5px', color: 'grey' }}>{region}</Text>
                                <StatusCall key={hckey(`${spec}_${intf}_statuscell`)} status={status} style={{ marginRight: '5px' }} />
                                <TimeTooltip key={hckey(`${spec}_${intf}_timetooltip`)} datetime={timestamp} />
                            </div>
                            <div key={hckey(`${spec}_${intf}_div`)} style={{ fontSize: '8px' }}>{data}</div>
                        </div>
                    );
                }
                return (
                    <div key={hckey(`${spec}_${intf}_div`)} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Text key={hckey(`${spec}_${intf}_text`)} style={{ marginRight: '5px', color: 'grey' }}>{region}</Text>
                        <StatusCall key={hckey(`${spec}_${intf}_statuscell`)} status={status} style={{ marginRight: '5px' }} />
                        <TimeTooltip key={hckey(`${spec}_${intf}_timetooltip`)} datetime={timestamp} />
                    </div>
                );
            })}
        </Box>
    );
}

const renderCard = (specStatusAndInterfaces: SpecStatusAndInterfaces, spec: string) => {
    return (
        <Card key={hckey(`${spec}_card`)} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
            <div key={hckey(`${spec}_div`)} style={{ marginRight: '5px' }}>
                <div key={hckey(`${spec}_div`)} style={{ display: 'flex', alignItems: 'left' }}>
                    <Image key={hckey(`${spec}_image`)}
                        width={15}
                        height={15}
                        src="/chain-rounded.svg"
                        alt="chain"
                        style={{ display: 'inline-block', verticalAlign: 'middle', paddingBottom: '1px', marginRight: '5px' }}
                    />
                    <Link key={hckey(`${spec}_link`)} href={`/spec/${spec}`} style={{ fontWeight: 'bold', marginRight: '5px', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
                        {spec}
                    </Link>
                </div>
                <StatusCall key={hckey(`${spec}_statuscell`)} status={specStatusAndInterfaces.overallStatus} />
            </div>
            <div className="spec-container" key={hckey(`${spec}_div`)} style={{ flex: 1, marginTop: '-5px', marginBottom: '-5px', display: 'none', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'center', minWidth: 0 }}>
                {specStatusAndInterfaces.interfaces && Object.keys(specStatusAndInterfaces.interfaces!).map((intf, index) => (
                    <div className="spec-item" key={hckey(`${spec}_div`)} style={{ marginRight: index < Object.keys(specStatusAndInterfaces.interfaces!).length - 1 ? '10px' : '0px', height: '100%', display: 'inline-flex', alignItems: 'center', minWidth: 'min-content' }}>
                        {renderInterface(specStatusAndInterfaces, spec, intf)}
                    </div>
                ))}
            </div>
        </Card>
    );
}

function handleProviderLatestHealthContainerResize() {
    const containers = document.querySelectorAll('.healthcontainer');
    containers.forEach(container => {
        const containerWidth = container.getBoundingClientRect().width;
        const cards = Array.from(container.children);

        let cardLines = [];
        let currentLine = [];
        let currentLineWidth = 0;

        for (let card of cards) {
            if ((currentLineWidth + card.getBoundingClientRect().width) > containerWidth) {
                cardLines.push({ cardsInLine: currentLine, lineWidth: currentLineWidth });
                currentLine = [];
                currentLineWidth = 0;
            }
            currentLine.push(card);
            currentLineWidth += card.getBoundingClientRect().width;
        }

        // If there are any cards left in currentLine, add them to cardLines
        if (currentLine.length > 0) {
            cardLines.push({ cardsInLine: currentLine, lineWidth: currentLineWidth });
        }

        // Sort cardLines by lineWidth in descending order
        cardLines.sort((lineA, lineB) => lineB.lineWidth - lineA.lineWidth);

        for (let line of cardLines) {
            for (let card of line.cardsInLine) {
                container.appendChild(card);
            }
        }
    });
}

const ProviderLatestHealthCards: React.FC<ProviderLatestHealthCardsProps> = ({ lavaId }) => {

    const { data, loading, error } = useApiDataFetch({
        dataKey: `providerLatestHealth/${lavaId}`,
    });

    if (error) return RenderInFullPageCard(<ErrorDisplay message={error} />);
    if (loading) return RenderInFullPageCard(<LoadingIndicator loadingText={`Loading ${lavaId} latest health stats`} greyText={`${lavaId} latest health`} />);

    const healthData: HealthData | null = data?.data || null;

    if (!healthData || Object.keys(healthData.specs).length === 0) {
        return null;
    }

    window.addEventListener('resize', handleProviderLatestHealthContainerResize);

    function toggleVisibility() {
        const elements = document.getElementsByClassName('spec-container');

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i] as HTMLElement;
            if (element.style.display === 'none') {
                element.style.display = 'flex';
            } else {
                element.style.display = 'none';
            }
        }

        handleProviderLatestHealthContainerResize();
    }

    const cards = healthData.specs.map(({ spec: specName, specData: SpecStatusAndInterfaces }) => {
        const interfacesCount = SpecStatusAndInterfaces.interfaces ? Object.keys(SpecStatusAndInterfaces.interfaces).length : 0;
        const card = renderCard(SpecStatusAndInterfaces, specName);
        return { interfacesCount, card, spec: specName };
    });

    return RenderInFullPageCard(
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div style={{ marginBottom: '9px' }}>
                <Box style={{ float: 'left', marginLeft: '8px', userSelect: 'text' }}>
                    Latest health metrics for provider specs queried from US/EU regions
                </Box>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <TextToggle key={hckey(`textoggle`)} openText='Full info' closeText='Basic info' onChange={toggleVisibility} style={{ marginRight: '-5px' }} />
                </div>
            </div>
            <div key={hckey(`div`)} className="healthcontainer" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', margin: "-2px", marginBottom: "-15px", fontSize: '10px', width: '100%', marginLeft: "-4px" }}>
                {cards.map(({ card }, _) => (
                    <div key={hckey(`div`)} style={{ marginRight: '2px' }}>
                        {card}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProviderLatestHealthCards;
