import { Container, Heading, Text } from '@radix-ui/themes';

function App() {
    return (
        <Container size="3" p="6">
            <Heading size="7" mb="2">
                Jikanban
            </Heading>
            <Text as="p" size="3" color="gray">
                Self-hosted, AI-assisted kanban board. In development.
            </Text>
        </Container>
    );
}

export default App;
