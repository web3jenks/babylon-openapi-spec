const fs = require('fs');
const yaml = require('js-yaml');

function mergeOpenAPI(file1, file2, outputFile) {
    try {
        // Load YAML files
        const spec1 = yaml.load(fs.readFileSync(file1, 'utf8'));
        const spec2 = yaml.load(fs.readFileSync(file2, 'utf8'));

        // Merge paths
        const mergedPaths = { ...spec1.paths, ...spec2.paths };

        // Merge components
        const mergedComponents = {
            schemas: { 
                ...spec1.components?.schemas, 
                ...spec2.components?.schemas 
            }
        };

        // Merge servers - replace with custom server
        const customServer = [{
            url: 'http://localhost:9090',
            description: 'Local Babylon gRPC Gateway. Default port is 9090.'
        }];

        // Create merged OpenAPI spec
        const mergedSpec = {
            openapi: "3.0.0",
            info: {
                title: "Babylon gRPC API Docs",
                version: "1.0.0",
                description: `|
                A Babylon gRPC Gateway is a REST interface for Babylon's gRPC. 
                This is a merged specification of the Babylon gRPC Gateway and 
                the CometBFT RPC.
                
                Supported RPC protocols:

                * URI over HTTP
                * JSONRPC over HTTP
                * JSONRPC over websockets
                
                ## Configuration

                RPC can be configured by tuning parameters under "[rpc]" table in the
                "$CMTHOME/config/config.toml" file or by using the "--rpc.X" command-line
                flags.

                The default RPC listen address is "tcp://127.0.0.1:26657".
                
                ## URI/HTTP

                A REST like interface. "curl localhost:26657/block?height=5"

                ## JSONRPC/HTTP

                JSONRPC requests can be POST'd to the root RPC endpoint via HTTP.
                "curl --header "Content-Type: application/json" --request POST --data '{"method": "block", "params": ["5"], "id": 1}' localhost:26657"

                ## JSONRPC/websockets

                JSONRPC requests can be also made via websocket.
                The websocket endpoint is at "/websocket", e.g. "localhost:26657/websocket".
                Asynchronous RPC functions like event "subscribe" and "unsubscribe" are
                only available via websockets.

                For example using the [websocat](https://github.com/vi/websocat) tool, you can subscribe for 'NewBlock' events
                with the following command:

                "echo '{ "jsonrpc": "2.0","method": "subscribe","id": 0,"params": {"query": "tm.event='"'NewBlock'"'"} }' | websocat -n -t ws://127.0.0.1:26657/websocket"
                `,
            },
            servers: customServer,  // Use custom server instead of mergedServers
            paths: mergedPaths,
            components: mergedComponents,
        };

        // Write to output file
        fs.writeFileSync(outputFile, yaml.dump(mergedSpec), 'utf8');
        console.log(`✅ Merged OpenAPI spec saved to ${outputFile}`);
    } catch (e) {
        console.error("❌ Error merging OpenAPI files:", e);
    }
}

// Command-line usage: node mergeOpenAPI.js file1.yaml file2.yaml output.yaml
const args = process.argv.slice(2);
if (args.length !== 3) {
    console.log("Usage: node mergeOpenAPI.js <file1.yaml> <file2.yaml> <output.yaml>");
    process.exit(1);
}

mergeOpenAPI(args[0], args[1], args[2]);