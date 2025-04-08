
import {
    f_websersocket_serve,
    f_v_before_return_response__fileserver
} from "https://deno.land/x/websersocket@5.0.0/mod.js"

import {
    O_ws_client
} from "./classes.module.js"
import { ensureDir } from "https://deno.land/std@0.224.0/fs/ensure_dir.ts";

import { f_o_config } from "./functions.module.js";
import {
    f_a_o_entry__from_s_path
} from "https://deno.land/x/handyhelpers@5.0.0/mod.js"

let s_path_abs_file_current = new URL(import.meta.url).pathname;
let s_path_abs_folder_current = s_path_abs_file_current.split('/').slice(0, -1).join('/');
const b_deno_deploy = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;

let a_o_ws_client = []

// const o_kv = await Deno.openKv();
// let o_config = await f_o_config();
// console.log({o_config});

// let s_path_abs_folder_cached_shaders = './folder_to_ensure';
// if(!b_deno_deploy){
//     await ensureDir(s_path_abs_folder_cached_shaders)// deno deploy is read only...
// }

let f_handler = async function(o_request){

    // websocket 'request' handling here
    if(o_request.headers.get('Upgrade') == 'websocket'){

        const {
            socket: o_socket,
            response: o_response
        } = Deno.upgradeWebSocket(o_request);
        let o_ws_client = new O_ws_client(
            crypto.randomUUID(),
            o_socket
        )
        a_o_ws_client.push(o_ws_client);

        o_socket.addEventListener("open", (o_e) => {
            console.log({
                o_e, 
                s: 'o_socket.open called'
            })
        });

        o_socket.addEventListener("message", async (o_e) => {
            console.log({
                o_e, 
                s: 'o_socket.message called'
            })
            let v_data = o_e.data;
            a_o_ws_client
                .filter(o=>o!=o_ws_client)  // send to all other clients, comment out to send to all clients
                .forEach(o=>{
                    o.o_socket.send('message was received from a client')

                })
        });
        o_socket.addEventListener("close", async (o_e) => {
            a_o_ws_client.splice(a_o_ws_client.indexOf(o_ws_client), 1);
            console.log({
                o_e, 
                s: 'o_socket.close called'
            })
        });

        return o_response;
    }
    // normal http request handling here
    let o_url = new URL(o_request.url);
    if(o_url.pathname == '/'){
        return new Response(
            await Deno.readTextFile(
                `${s_path_abs_folder_current}/localhost/client.html`
            ),
            { 
                headers: {
                    'Content-type': "text/html"
                }
            }
        );
    }
    if(o_url.pathname == '/some_endpoint'){
        let o_post_data = o_request.json();
        return new Response(
            JSON.stringify(
                {
                    s: 'some response',
                    b_success: true
                }
            ),
            { 
                headers: {
                    'Content-type': "application/json"
                }
            }
        );
    }

    return f_v_before_return_response__fileserver(
        o_request,
        `${s_path_abs_folder_current}/localhost/`
    )

}

let s_name_host = Deno.hostname(); // or maybe some ip adress 112.35.8.13
let b_development = s_name_host != 'the_server_name_here';
let s_name_host2 = (b_development) ? 'localhost': s_name_host;
// let o_info_certificates = {
//     s_path_certificate_file: './self_signed_cert_7fa3d9b0-ee4c-4853-8fa2-626266d7db95.crt',
//     s_path_key_file: './self_signed_key_7fa3d9b0-ee4c-4853-8fa2-626266d7db95.key'
// }
await f_websersocket_serve(
    [
        {
            n_port: 8081,
            b_https: false,
            s_hostname: s_name_host,
            f_v_before_return_response: f_handler
        },
        ...[
            (!b_deno_deploy) ? {
                // ...o_info_certificates,
                n_port: 8443,
                b_https: true,
                s_hostname: s_name_host,
                f_v_before_return_response: f_handler
            } : false
        ].filter(v=>v)   
    ]
);