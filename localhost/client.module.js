
import {
    f_add_css,
    f_s_css_prefixed,
    o_variables, 
    f_s_css_from_o_variables
} from "https://deno.land/x/f_add_css@2.0.0/mod.js"

import {
    f_o_html_from_o_js,
    f_o_proxified_and_add_listeners
} from "https://deno.land/x/handyhelpers@5.1.96/mod.js"


o_variables.n_rem_font_size_base = 1. // adjust font size, other variables can also be adapted before adding the css to the dom
o_variables.n_rem_padding_interactive_elements = 0.5; // adjust padding for interactive elements 
f_add_css(
    `
    body{
        min-height: 100vh;
        min-width: 100vw;
        /* background: rgba(0,0,0,0.84);*/
        display:flex;
        justify-content:center;
        align-items:flex-start;
    }
    canvas{
        width: 100%;
        height: 100%;
        position:fixed;
        z-index:-1;
    }
    #o_el_time{
        margin:1rem;
        background: rgba(0, 0, 0, 0.4);
        padding: 1rem;
    }
    ${
        f_s_css_from_o_variables(
            o_variables
        )
    }
    `
);


let f_callback_beforevaluechange = function(a_s_path, v_old, v_new){
    console.log('a_s_path')
    console.log(a_s_path)
    let s_path = a_s_path.join('.');
    if(s_path == 'a_o_person.0.s_name'){
        console.log('name of first person will be changed')
    }
}
let f_callback_aftervaluechange = function(a_s_path, v_old, v_new){
    console.log('a_s_path')
    console.log(a_s_path)
    let s_path = a_s_path.join('.');
    if(s_path == 'a_o_person.0.s_name'){
        console.log('name of first person has been changed')
    }
}

let o_div = document;
let o_state = f_o_proxified_and_add_listeners(
    {
        a_s_name: [
            'hans', 
            'frida', 
            'gretel', 
            'ferdinand'
        ]
    }, 
    f_callback_beforevaluechange,
    f_callback_aftervaluechange, 
    o_div
)

globalThis.o_state = o_state

let f_sleep_ms = async function(n_ms){
    return new Promise((f_res, f_rej)=>{
        setTimeout(()=>{
            return f_res(true)
        },n_ms)
    })
}
// then we build the html 
let o = await f_o_html_from_o_js(
    {
        class: "test",
        f_a_o: ()=>{
            return [
                
                {
                    f_a_o:async ()=> [
                        {
                            innerText: "name is: staticaddedperson"
                        },
                        ...o_state.a_s_name.map(async s=>{
                            await f_sleep_ms(Math.random()*1000)
                            return {
                                style: `background: rgb(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255})`,
                                f_s_innerText: ()=>{
                                    return `name is: ${s}`
                                }
                            }
                        }), 
                        {
                            s_tag: "canvas", 
                            f_after_render: (o_el)=>{
                                let o_ctx = o_el.getContext('2d');
                                o_ctx.beginPath(); // Start a new path
                                o_ctx.rect(10, 20, 150, 100); // Add a rectangle to the current path
                                o_ctx.fill(); // Render the path
                            }
                        }

                    ],
                    a_s_prop_sync: 'a_s_name',
                },
            
            ]
        }
    }, 
    o_state
)
document.body.appendChild(o)