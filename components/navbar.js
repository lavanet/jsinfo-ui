import { Flex, Button, Card, Box, Table, Container, Tabs, Section, IconButton, TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon, BookmarkIcon } from '@radix-ui/react-icons';

export function Navbar() {
    return (
        <Card>
            <Flex justify={'between'}>
                <Flex >
                    <Button variant="soft">
                        Index
                    </Button>
                </Flex>
                <Box>
                    <TextField.Root>
                        <TextField.Slot>
                            <MagnifyingGlassIcon height="16" width="16" />
                        </TextField.Slot>
                        <TextField.Input variant="soft" placeholder="Search by address..." />
                    </TextField.Root>
                </Box>
            </Flex>
        </Card>
    )
}
