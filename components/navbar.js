import { useRouter } from "next/router";
import { useRef } from 'react';
import Link from 'next/link';
import { Flex, Button, Card, Box, TextField, Link as RadixLink } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

export function Navbar() {
    const router = useRouter()
    const searchText = useRef(null)

    const goSearch = (e) => {
        e.preventDefault()
        if (searchText.current === null) {
            return
        }
        const cleanText = searchText.current.value.trim()
        if (cleanText.length != 44) {
            return
        }
        if (!cleanText.startsWith('lava@')) {
            return
        }
        router.push(`/provider/${searchText.current.value}`)
        searchText.current.value = ''
    }

    return (
        <Card>
            <Flex justify={'between'}>
                <Flex>
                    <Link href='/'>
                        <Button variant="soft">
                            Index
                        </Button>
                    </Link>
                </Flex>
                <Box>
                    <TextField.Root>
                        <TextField.Slot>
                            <RadixLink onClick={goSearch}>
                                <MagnifyingGlassIcon height="16" width="16" />
                            </RadixLink>
                        </TextField.Slot>
                        <form onSubmit={goSearch}>
                            <TextField.Input ref={searchText} variant="soft" placeholder="Search by address..." />
                        </form>
                    </TextField.Root>
                </Box>
            </Flex>
        </Card>
    )
}
