
import {
    f_add_css,
    f_s_css_prefixed,
    o_variables, 
    f_s_css_from_o_variables
} from "https://deno.land/x/f_add_css@2.0.0/mod.js"

import {
    f_o_html_from_o_js,
    f_o_proxified_and_add_listeners,
    f_o_js_a_o_toast,
    f_o_toast,
    o_state_a_o_toast,
    s_css_a_o_toast
} from "https://deno.land/x/handyhelpers@5.2.4/mod.js"

import * as THREE from '/three.js-r126/build/three.module.js';
import { OrbitControls } from '/three.js-r126/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from '/three.js-r126/examples/jsm/exporters/STLExporter.js';
import { ConvexGeometry } from '/three.js-r126/examples/jsm/geometries/ConvexGeometry.js';
import { SimplifyModifier } from '/three.js-r126/examples/jsm/modifiers/SimplifyModifier.js';
import {
    STLLoader
} from '/three.js-r126/examples/jsm/loaders/STLLoader.js'

import { BufferGeometryUtils } from '/three.js-r126/examples/jsm/utils/BufferGeometryUtils.js';
import { Line2 } from '/three.js-r126/examples/jsm/lines/Line2.js';
import { LineMaterial } from '/three.js-r126/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from '/three.js-r126/examples/jsm/lines/LineGeometry.js';

// import { STLExporter } from '/three/STLExporter.js';
// if you need more addons/examples download from here...
//  
let s_id_error_msg = 'error_msg'
o_variables.n_rem_font_size_base = 1. // adjust font size, other variables can also be adapted before adding the css to the dom
o_variables.n_rem_padding_interactive_elements = 0.5; // adjust padding for interactive elements 
f_add_css(
    `
    body{
        min-height: 100vh;
        min-width: 100vw;
    }
    #${s_id_error_msg}{
        position: absolute;
        width: 100%;
        top: 0;
        background: #f5c0c099;
        color: #5e0505;
        padding: 1rem;
        z-index: 111;
    }
    ${s_css_a_o_toast}
    ${
        f_s_css_from_o_variables(
            o_variables
        )
    }
    `
);

import * as o_mod from "./@tarikjabiri/dxf/lib/index.esm.js";
let o_dxf;



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
    if(s_path == 'n_thickness'){
        f_update_rendering();
    }
}
let f_ov = function(ov){
    let a_s = Object.keys(o_state.ov);
    let s_prop_not_reduntant = Object.keys(ov).find(s=>{
        return !a_s.includes(s)
    });
    if(s_prop_not_reduntant){
        o_state.n_ts_ov_changed = new Date().getTime();
        for(let s_prop in ov){
            o_state.ov[s_prop] = ov[s_prop]
        }
    }
    // o_state.ov = ov;
    return o_state.ov;
}
let f_o_vec = function(n_x, n_y, n_z =0){return {n_x, n_y, n_z}}
let f_o_line = function(o_trn, o_trn2){return {o_trn, o_trn2}}
let f_o_circle = function(o_trn, n_radius){return {o_trn, n_radius}}
let n_tau = Math.PI*2;

let f_a_o_p_reg_poly = function(
    o_trn,
    n_corners, 
    n_amp, 
    n_radians_rotation
){
    let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
        let n_it_nor = parseFloat(n_idx)/n_corners;
        let o_trn2 = f_o_vec(
            Math.sin(n_tau*n_it_nor+n_radians_rotation)*n_amp,
            Math.cos(n_tau*n_it_nor+n_radians_rotation)*n_amp,
            0,
        )
        return f_o_vec(
            o_trn.n_x+o_trn2.n_x,
            o_trn.n_y+o_trn2.n_y,
            o_trn.n_z+o_trn2.n_z,
        );
    });
    return a_o
}

let f_o_reg_poly = function(
    o_trn, 
    n_rot_radians,
    n_radius, 
    n_corners, 
    n_extrusion
){
    let a_o = f_a_o_p_reg_poly(
        o_trn,
        n_corners, 
        n_radius, 
        0.,//n_rot_radians
    )
    // Convert your points to Three.js Vector2 array
    const a_o_point = a_o.map(o => new THREE.Vector3(o.n_x, o.n_y, o.n_z));
    // Create a shape from the points
    const o_shape = new THREE.Shape(a_o_point);

    // Extrusion settings (0.2mm in z-direction)
    const extrudeSettings = {
        depth: n_extrusion, // 0.2mm extrusion
        bevelEnabled: false // No bevel for simple extrusion
    };

    // Create the extruded geometry
    const geometry = new THREE.ExtrudeGeometry(o_shape, extrudeSettings);

    // Create a mesh with the geometry and a material
    const mesh = new f_o_shaded_mesh(geometry);
    
    // Apply translation if o_trn is provided
    if (o_trn) {
        mesh.position.set(
            o_trn.n_x || 0,
            o_trn.n_y || 0,
            o_trn.n_z || 0
        );
    }

    // Apply rotation if n_rot_radians is provided
    if (n_rot_radians !== undefined) {
        mesh.rotation.z = n_rot_radians; // Rotate around Z-axis
    }

    return mesh
}
let f_o_function = function(
    s_name, 
    f_function
){
    return {
        s_name, 
        s_function : f_function.toString()
    }
}
let f_o_shaded_mesh_old = function(
    o_geometry,
    n_color = 0x6bb9f2,
    n_edge_color = 0x000000,
    n_edge_width = 0.0002
){
    // 1. Create the shaded material (Phong for nice lighting)
    const o_shaded_material = new THREE.MeshPhongMaterial({
        color: 0xCBC3E3,    // red (can also use a CSS color string here), 
        side: THREE.DoubleSide, // This makes it double-sided!

    });
    
    // 2. Create the wireframe material
    const o_wire_material = new THREE.MeshBasicMaterial({
        color: n_edge_color,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    
    // 3. Create the edge lines (cleaner than wireframe material)
    const o_edges = new THREE.EdgesGeometry(o_geometry);
    // const o_line_material = new THREE.LineBasicMaterial({ 
    //     color: n_edge_color, 
    //     linewidth: n_edge_width, 
    //     opacity: 0.2
    // });
    // const o_edge_lines = new THREE.LineSegments(o_edges, o_line_material);
    
    // 4. Create the shaded mesh
    const o_shaded_mesh = new THREE.Mesh(o_geometry, o_shaded_material);
    
    // 5. Combine in a group
    const o_group = new THREE.Group();
    o_group.add(o_shaded_mesh);
    // o_group.add(o_edge_lines);
    
    return o_group;
};
let f_o_shaded_mesh = function(
    o_geometry,
    n_color = 0xCBC3E3ff,         // Main mesh color
    n_edge_color = 0x000000,     // Wireframe/edge color
    n_edge_width = 0.0002,
    b_show_wireframe = true,     // Toggle wireframe
    b_show_vertices = false,     // Toggle vertices
    n_vertex_size = 0.01,        // Vertex sphere size
    n_vertex_color = 0xff0000    // Vertex color
) {
    // 1. Main shaded material (Phong for lighting)
    const o_shaded_material = new THREE.MeshPhongMaterial({
        color: n_color,
        side: THREE.DoubleSide,
    });

    // 2. Create the mesh
    const o_shaded_mesh = new THREE.Mesh(o_geometry, o_shaded_material);

    // 3. Group to hold everything
    const o_group = new THREE.Group();
    o_group.add(o_shaded_mesh);

    // 4. Add wireframe (using EdgesGeometry + LineSegments)
    if (b_show_wireframe) {
        const o_edges = new THREE.EdgesGeometry(o_geometry);
        const o_line_material = new THREE.LineBasicMaterial({ 
            color: n_edge_color, 
            linewidth: 1,       // Note: linewidth may not work in all browsers
        });
        const o_wireframe = new THREE.LineSegments(o_edges, o_line_material);
        o_group.add(o_wireframe);
    }

    // 5. Add vertices (if enabled)
    if (b_show_vertices) {
        const a_vertices = o_geometry.attributes.position.array;
        const o_vertex_geometry = new THREE.SphereGeometry(n_vertex_size, 8, 8);
        const o_vertex_material = new THREE.MeshBasicMaterial({ color: n_vertex_color });

        for (let i = 0; i < a_vertices.length; i += 3) {
            const o_sphere = new THREE.Mesh(o_vertex_geometry, o_vertex_material);
            o_sphere.position.set(a_vertices[i], a_vertices[i+1], a_vertices[i+2]);
            o_group.add(o_sphere);
        }
    }

    return o_group;
};
let f_o_geometry_from_a_o_p_polygon_vertex = function(a_o_p, n_its_corner){

    let a_o_i = [];//indices
    let a_o_v = [...a_o_p.map(o=>{return [o.n_x, o.n_y, o.n_z]}).flat()];//vertices
    let n_its_layer = a_o_p.length / n_its_corner;
    for(let n_it_layer = 0; n_it_layer < (n_its_layer-1); n_it_layer+=1){
        let n_idx_start_corner_on_layer = n_it_layer*n_its_corner;
        for(let n_it_corner = 0; n_it_corner < n_its_corner; n_it_corner+=1){

            let n_idx_p = n_it_corner;
            let n_idx_p_top = n_it_corner+n_its_corner;
            let n_idx_p_next = (n_it_corner+1)%n_its_corner;
            let n_idx_p_top_next = n_idx_p_next+n_its_corner;

            n_idx_p+=n_idx_start_corner_on_layer
            n_idx_p_top+=n_idx_start_corner_on_layer
            n_idx_p_next+=n_idx_start_corner_on_layer
            n_idx_p_top_next+=n_idx_start_corner_on_layer

            a_o_i.push(n_idx_p, n_idx_p_next, n_idx_p_top);
            a_o_i.push(n_idx_p_top, n_idx_p_next, n_idx_p_top_next);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(a_o_i);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(a_o_v, 3));
    
    // Compute normals for proper lighting
    geometry.computeVertexNormals();
    return geometry

}
let f_o_geometry_from_a_o_p_polygon_face = function(a_o_p){

    // assuming the first array item is the center point of the polygon 

    
    let a_o_i = [];//indices
    let a_o_v = [...a_o_p.map(o=>{return [o.n_x, o.n_y, o.n_z]}).flat()];//vertices
    let n_idx_vertex_center = 0;
    let n_corners = a_o_p.length-1;
    for(let n_i = 0; n_i < n_corners; n_i+=1){
        let n_idx_p1 = n_idx_vertex_center; 
        let n_idx_p2 = (n_i)%n_corners
        let n_idx_p3 = (n_i+1)%n_corners
        n_idx_p2+=1;//+1 because of added cneter point
        n_idx_p3+=1;//+1 because of added cneter point
        a_o_i.push(n_idx_p1,n_idx_p2,n_idx_p3)
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setIndex(a_o_i);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(a_o_v, 3));
    
    // Compute normals for proper lighting
    geometry.computeVertexNormals();
    return geometry


}
function f_o_geometry_from_a_o_p(points) {
    // 1. Create 2D shape (ignores Z)
    const shape = new THREE.Shape();
    shape.moveTo(points[0].n_x, points[0].n_y);
    for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].n_x, points[i].n_y);
    }

    // 2. Generate geometry (triangulates in 2D)
    const geometry = new THREE.ShapeGeometry(shape);

    // 3. Apply Z-coordinates manually
    const posAttr = geometry.getAttribute('position');
    for (let i = 0; i < points.length; i++) {
        posAttr.setZ(i, points[i].n_z); // Apply original Z
    }
    posAttr.needsUpdate = true;

    // 4. Recompute normals (since we modified Z)
    geometry.computeVertexNormals();

    return geometry;
}

let a_o_function = [
    f_o_function(
        'template', 
        function() {
    
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 100.;
            let n_layer_height = 1;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 40.;
            let a_o_p_outside = [];
            let n_radius_base = n_height/1.618;
            // const phi = (1 + Math.sqrt(5)) / 2;
    
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
        
            function f_a_o_p(
                n_it_layer_nor
                ) {
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it / n_corners;
                    let n_amp = n_radius_base;
                    let n_rad_offset = 0;
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        n_it_layer_nor*n_height
                    );
        
                    return o_trn1
        
        
                }).flat();
                return a_o
            }
        
        
        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
        
                let a_o_p = f_a_o_p(
                    n_it_layer_nor
                );
                a_o_p_outside.push(...a_o_p);
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p(a_o_p)
                    )
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'vase_low_poly_noise',
        function() {
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 30*8.;
            let n_layer_height = 30;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 9.;
            let a_o_p_outside = [];
            let n_radius_base = 55
            // const phi = (1 + Math.sqrt(5)) / 2;
        
            noise.seed(Math.random());
            let n_its_wave = 24.;
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
        
            function f_a_o_p(o_trn, n_corners, n_amp, n_rad_offset, n_it_layer_nor) {
        
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
        
                    let n_amp = n_radius_base;
                    let n_it_nor_corner = parseInt(n_idx) / n_corners;
                    n_amp += Math.sin(n_it_layer_nor*0.95*n_tau+0.2)*n_radius_base*.5;
                    let n_noise_layer = (noise.simplex2(
                        (n_it_nor_corner + n_it_layer_nor * 2.),
                        (n_it_nor_corner + n_it_layer_nor * 20.)
                    ) +1)*.5*(1./n_corners/2);
                    n_it_nor_corner += n_noise_layer;
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        o_trn.n_z
                    );
        
                    return o_trn1
        
        
                }).flat();
        
                return a_o
            }
        
        
        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let n_radius = n_radius_base;
                n_radius += Math.sin(n_it_layer_nor * n_tau * 0.8) * 20;
        
        
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_corners, 0, 0, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
        
        
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
        
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'low_poly_vase',
        function() {
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 200.;
            let n_layer_height = 10;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 12.;
            let a_o_p_outside = [];
            let n_radius_base = 55
            // const phi = (1 + Math.sqrt(5)) / 2;
        
            noise.seed(Math.random());
            let n_its_wave = 24.;
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
        
            function f_a_o_p(o_trn, n_corners, n_amp, n_rad_offset, n_it_layer_nor) {
        
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
        
                    let n_amp = n_radius_base;
                    let n_it_nor_corner = parseInt(n_idx) / n_corners;
                    n_amp += Math.sin(n_it_layer_nor*0.95*n_tau+0.2)*n_radius_base*.5;
                    n_it_nor_corner += Math.random()*(1./n_corners/2)
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        o_trn.n_z
                    );
        
                    return o_trn1
        
        
                }).flat();
        
                return a_o
            }
        
        
        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let n_radius = n_radius_base;
                n_radius += Math.sin(n_it_layer_nor * n_tau * 0.8) * 20;
        
        
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_corners, 0, 0, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
        
        
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
        
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        },
    ),
    f_o_function(
        'different_top_finish', 
        function() {
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 200.;
            let n_layer_height = 0.6;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 300.;
            let a_o_p_outside = [];
            let n_radius_base = 33
            // const phi = (1 + Math.sqrt(5)) / 2;
        
            noise.seed(Math.random());
            let n_its_wave = 24.;
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
        
            function f_a_o_p(o_trn, n_corners, n_amp, n_rad_offset, n_it_layer_nor) {
        
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
        
                    let n_rad_offset = n_it_layer_nor * (n_tau / n_corners / 2);
                    let n_amp = n_radius_base;
                    n_amp += Math.sin(n_it_layer_nor * n_tau * 0.95) * n_radius_base * 0.5
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it / n_corners;
        
                    let nrad = Math.sin(n_it_nor_corner * n_tau * 3.) * .5 + .5;
                    let o1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(nrad * n_tau + n_rad_offset),
                        Math.cos(nrad * n_tau + n_rad_offset),
                        0
                    );
        
                    let x = (n_it_nor_corner * n_its_wave) % 1.;
                    let n_noise_layer = noise.simplex2(
                        (o1.n_x + n_it_layer_nor * 20.) * .2,
                        (o1.n_y + n_it_layer_nor * 20.) * .2
                    ) * .5;
                    let w = n_noise_layer;
                    let l = x + w;
                    let k = x - w;
        
                    let a = Math.pow(l, 2);
                    let b = Math.pow(l - 1, 2);
                    let c = Math.min(a, b);
        
                    c = Math.min(c, 1);
        
        
                    // https://www.desmos.com/calculator/mlhhw6p2du
                    let na = n_amp + c * 5;
        
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * na,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * na,
                        0
                    );
                    
                    o_trn1 = f_o_vec(
                        o_trn.n_x + o_trn1.n_x,
                        o_trn.n_y + o_trn1.n_y,
                        o_trn.n_z + o_trn1.n_z,
                    )
                    let nh = Math.abs(n_it_nor_corner - .5);
                    let nl = Math.max(0, n_it_layer_nor - .9);
                    o_trn1.n_z += nl * nh*500;
        
                    return o_trn1
        
        
                }).flat();
        
                return a_o
            }
        
        
        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let n_radius = n_radius_base;
                n_radius += Math.sin(n_it_layer_nor * n_tau * 0.8) * 20;
        
        
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_corners, 0, 0, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
        
        
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
        
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'wtf', 
        function() {
            noise.seed(Math.random());
                    
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 200.;
            let n_layer_height = 1;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 4.; // 4 polygon corners this should give a squircle
            let n_its_circle = 500.;

            let a_o_p_outside = [];
            let n_radius_base = 100;
            let n_circumfence = n_radius_base*2*(n_tau/2);
            let n_dist_max = Math.sqrt(
                Math.pow(n_height, 2) 
                +Math.pow(n_radius_base,2)
            )
            let f_n_rad_curve = function(n_it_layer_nor){
                return Math.sin((1.-n_it_layer_nor)*n_tau*0.8+n_tau*0.14)*20+n_radius_base;

            }
            // const phi = (1 + Math.sqrt(5)) / 2;
            let a_o_p_random = new Array(444).fill(0).map((n)=>{
                let n_rand = Math.random();
                let n_it_layer_nor = Math.random();
                let nrad = f_n_rad_curve(n_it_layer_nor)
                return {
                    n_x:Math.sin(n_rand*n_tau)*nrad, 
                    n_y:Math.cos(n_rand*n_tau)*nrad,
                    n_z: n_it_layer_nor*n_height
                }
            });
            

            function f_o_p_on_regular_polygon(nSides, radius, n_it_nor, n_rad_offset) {
                // Calculate the angle between each vertex (in radians)
                let t = n_it_nor;
                t = Math.max(0, Math.min(1, t));
                
                // Total angle for full rotation
                const totalAngle = 2 * Math.PI;
                // Angle per side
                const angleStep = totalAngle / nSides;
                
                // Calculate which edge we're on
                const edgeLength = 1 / nSides;
                const edgeIndex = Math.floor(t / edgeLength);
                const edgeProgress = (t % edgeLength) / edgeLength;
                
                // Calculate angles for current and next vertex
                const angle1 = edgeIndex * angleStep;
                const angle2 = ((edgeIndex + 1) % nSides) * angleStep;
                
                // Get the two vertices
                const x1 = radius * Math.cos(angle1+n_rad_offset);
                const y1 = radius * Math.sin(angle1+n_rad_offset);
                const x2 = radius * Math.cos(angle2+n_rad_offset);
                const y2 = radius * Math.sin(angle2+n_rad_offset);
                
                // Linear interpolation between vertices
                const x = x1 + edgeProgress * (x2 - x1);
                const y = y1 + edgeProgress * (y2 - y1);
                
                return { n_x:x, n_y:y, n_z:0};
        }

            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
            let f_n_len = function(o){
                return Math.sqrt(
                    Math.pow(o.n_x,2)
                    + Math.pow(o.n_y,2)  
                    + Math.pow(o.n_z,2)
                )
            }
            function f_a_o_p(o_trn, n_radius,n_it_layer_nor,n_rad_offset) {
                let n_2 = f_n_rad_curve(n_it_layer_nor);
        
                let a_o = new Array(n_its_circle).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_circle = n_it / n_its_circle;
                    
                    let o_p_now = {
                        n_x: Math.sin(n_it_nor_circle*n_tau)*n_2, 
                        n_y: Math.cos(n_it_nor_circle*n_tau)*n_2, 
                        n_z: o_trn.n_z
                    }
                    
                    let n_dist = n_dist_max;

                    for(let o of a_o_p_random){
                        let n_d = f_n_len(
                            f_o_vec(
                                o_p_now.n_x - o.n_x,
                                o_p_now.n_y - o.n_y,
                                o_p_now.n_z - o.n_z,
                            )
                        );
                        n_d = 1.-(n_dist_max-n_d)
                        if(n_d < n_dist){
                            n_dist = n_d
                        }
                    };
                    n_dist += Math.sin(n_dist*.3*n_tau)*0.9;
                    let na = n_dist//*.5+n_noise_layer;
                    na += n_2;
                    // console.log(n_dist)
                    
                    let o_p = f_o_vec(
                        Math.sin(n_it_nor_circle*n_tau)*na,
                        Math.cos(n_it_nor_circle*n_tau)*na,
                        0
                    )

                    return f_o_vec(
                        o_trn.n_x + o_p.n_x,
                        o_trn.n_y + o_p.n_y,
                        o_trn.n_z + o_p.n_z,
                    )
                    
        
                }).flat();
                return a_o
            }
        

        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
        
                let n_rad_offset = n_it_layer_nor*n_tau/n_corners;
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), 0, n_it_layer_nor,n_rad_offset);
                a_o_p_outside.push(...a_o_p);
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_its_circle)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'noise_sum',
        function() {
            noise.seed(Math.random());
                    
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 150.;
            let n_layer_height = .5;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 4.; // 4 polygon corners this should give a squircle
            let n_its_circle = 1000.;

            let a_o_p_outside = [];
            let n_radius_base = 20;
            let n_circumfence = n_radius_base*2*(n_tau/2);
            let n_dist_max = Math.sqrt(
                Math.pow(n_height, 2) 
                +Math.pow(n_radius_base,2)
            )
            // const phi = (1 + Math.sqrt(5)) / 2;
            let a_o_p_random = new Array(20).fill(0).map((n)=>{
                let n_rand = Math.random();
                return {
                    n_x:Math.sin(n_rand*n_tau)*n_radius_base, 
                    n_y:Math.cos(n_rand*n_tau)*n_radius_base, 
                    n_z: Math.random()*n_height
                }
            });
            

            function f_o_p_on_regular_polygon(nSides, radius, n_it_nor, n_rad_offset) {
                // Calculate the angle between each vertex (in radians)
                let t = n_it_nor;
                t = Math.max(0, Math.min(1, t));
                
                // Total angle for full rotation
                const totalAngle = 2 * Math.PI;
                // Angle per side
                const angleStep = totalAngle / nSides;
                
                // Calculate which edge we're on
                const edgeLength = 1 / nSides;
                const edgeIndex = Math.floor(t / edgeLength);
                const edgeProgress = (t % edgeLength) / edgeLength;
                
                // Calculate angles for current and next vertex
                const angle1 = edgeIndex * angleStep;
                const angle2 = ((edgeIndex + 1) % nSides) * angleStep;
                
                // Get the two vertices
                const x1 = radius * Math.cos(angle1+n_rad_offset);
                const y1 = radius * Math.sin(angle1+n_rad_offset);
                const x2 = radius * Math.cos(angle2+n_rad_offset);
                const y2 = radius * Math.sin(angle2+n_rad_offset);
                
                // Linear interpolation between vertices
                const x = x1 + edgeProgress * (x2 - x1);
                const y = y1 + edgeProgress * (y2 - y1);
                
                return { n_x:x, n_y:y, n_z:0};
        }

            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
            let f_n_len = function(o){
                return Math.sqrt(
                    Math.pow(o.n_x,2)
                    + Math.pow(o.n_y,2)  
                    + Math.pow(o.n_z,2)
                )
            }
            function f_a_o_p(o_trn, n_radius,n_it_layer_nor,n_rad_offset) {
        
                let a_o = new Array(n_its_circle).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_circle = n_it / n_its_circle;
                    
                    let n_radians = Math.sin(n_it_nor_circle*3.*n_tau);
                    let n_x1 = Math.sin(n_radians*n_tau)
                    let n_y2 = Math.cos(n_radians*n_tau)
                    let n_x = Math.sin(n_it_nor_circle*n_tau)
                    let n_y = Math.cos(n_it_nor_circle*n_tau)

                    let n_dist = n_dist_max;

                    let n_noise_layer = 0;
                    let n_itsn = 100;
                    for(let n= 1; n <= n_itsn; n+=1){
                        n_noise_layer+=
                            noise.simplex2(
                            (n_x1*n+n_it_layer_nor*20),
                            (n_y2*n+n_it_layer_nor*20),
                        )*(1./n);
                    }
                    let na = n_radius+n_noise_layer*.2;
                    na += Math.sin(n_it_layer_nor*n_tau*0.95)*9
                    // console.log(n_dist)
                    
                    let o_p = f_o_vec(
                        Math.sin(n_it_nor_circle*n_tau)*na,
                        Math.cos(n_it_nor_circle*n_tau)*na,
                        0
                    )

                    return f_o_vec(
                        o_trn.n_x + o_p.n_x,
                        o_trn.n_y + o_p.n_y,
                        o_trn.n_z + o_p.n_z,
                    )
                    
        
                }).flat();
                return a_o
            }
        

        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let n_radius = n_radius_base//+Math.sin(n_it_layer_nor*n_tau)*n_radius_base*0.6;
                //n_radius += Math.sin(n_it_layer_nor*n_tau*0.8)*n_radius_base/2;
        
                let n_rad_offset = n_it_layer_nor*n_tau/n_corners;
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_radius, n_it_layer_nor,n_rad_offset);
                a_o_p_outside.push(...a_o_p);
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_its_circle)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'vase_voronoi',
        function() {
            noise.seed(Math.random());
                    
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 100.;
            let n_layer_height = 1;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 4.; // 4 polygon corners this should give a squircle
            let n_its_circle = 500.;

            let a_o_p_outside = [];
            let n_radius_base = 20;
            let n_circumfence = n_radius_base*2*(n_tau/2);
            let n_dist_max = Math.sqrt(
                Math.pow(n_height, 2) 
                +Math.pow(n_radius_base,2)
            )
            // const phi = (1 + Math.sqrt(5)) / 2;
            let a_o_p_random = new Array(20).fill(0).map((n)=>{
                let n_rand = Math.random();
                return {
                    n_x:Math.sin(n_rand*n_tau)*n_radius_base, 
                    n_y:Math.cos(n_rand*n_tau)*n_radius_base, 
                    n_z: Math.random()*n_height
                }
            });
            

            function f_o_p_on_regular_polygon(nSides, radius, n_it_nor, n_rad_offset) {
                // Calculate the angle between each vertex (in radians)
                let t = n_it_nor;
                t = Math.max(0, Math.min(1, t));
                
                // Total angle for full rotation
                const totalAngle = 2 * Math.PI;
                // Angle per side
                const angleStep = totalAngle / nSides;
                
                // Calculate which edge we're on
                const edgeLength = 1 / nSides;
                const edgeIndex = Math.floor(t / edgeLength);
                const edgeProgress = (t % edgeLength) / edgeLength;
                
                // Calculate angles for current and next vertex
                const angle1 = edgeIndex * angleStep;
                const angle2 = ((edgeIndex + 1) % nSides) * angleStep;
                
                // Get the two vertices
                const x1 = radius * Math.cos(angle1+n_rad_offset);
                const y1 = radius * Math.sin(angle1+n_rad_offset);
                const x2 = radius * Math.cos(angle2+n_rad_offset);
                const y2 = radius * Math.sin(angle2+n_rad_offset);
                
                // Linear interpolation between vertices
                const x = x1 + edgeProgress * (x2 - x1);
                const y = y1 + edgeProgress * (y2 - y1);
                
                return { n_x:x, n_y:y, n_z:0};
        }

            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
            let f_n_len = function(o){
                return Math.sqrt(
                    Math.pow(o.n_x,2)
                    + Math.pow(o.n_y,2)  
                    + Math.pow(o.n_z,2)
                )
            }
            function f_a_o_p(o_trn, n_radius,n_it_layer_nor,n_rad_offset) {
        
                let a_o = new Array(n_its_circle).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_circle = n_it / n_its_circle;
                    
                    let o_p_now = {
                        n_x: Math.sin(n_it_nor_circle*n_tau)*n_radius, 
                        n_y: Math.cos(n_it_nor_circle*n_tau)*n_radius, 
                        n_z: o_trn.n_z
                    }
                    
                    let n_dist = n_dist_max;

                    for(let o of a_o_p_random){
                        let n_d = f_n_len(
                            f_o_vec(
                                o_p_now.n_x - o.n_x,
                                o_p_now.n_y - o.n_y,
                                o_p_now.n_z - o.n_z,
                            )
                        );
                        n_d = 1.-(n_dist_max-n_d)
                        if(n_d < n_dist){
                            n_dist = n_d
                        }
                    };

                    let n_noise_layer = noise.simplex2(
                        (o_p_now.n_x+n_it_layer_nor)*.2,
                        (o_p_now.n_z+n_it_layer_nor)*.2
                    );

                    let na = n_radius+n_dist*.5+n_noise_layer;
                    na += Math.sin(n_it_layer_nor*n_tau*0.95)*9
                    // console.log(n_dist)
                    
                    let o_p = f_o_vec(
                        Math.sin(n_it_nor_circle*n_tau)*na,
                        Math.cos(n_it_nor_circle*n_tau)*na,
                        0
                    )

                    return f_o_vec(
                        o_trn.n_x + o_p.n_x,
                        o_trn.n_y + o_p.n_y,
                        o_trn.n_z + o_p.n_z,
                    )
                    
        
                }).flat();
                return a_o
            }
        

        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let n_radius = n_radius_base//+Math.sin(n_it_layer_nor*n_tau)*n_radius_base*0.6;
                //n_radius += Math.sin(n_it_layer_nor*n_tau*0.8)*n_radius_base/2;
        
                let n_rad_offset = n_it_layer_nor*n_tau/n_corners;
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_radius, n_it_layer_nor,n_rad_offset);
                a_o_p_outside.push(...a_o_p);
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_its_circle)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),

    f_o_function(
        'vase_interpolated_polygon_corners',
        function() {

            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 100.;
            let n_layer_height = 1;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 4.; // 4 polygon corners this should give a squircle
            let n_its_circle = 500.;
            let a_o_p_outside = [];
            let n_radius_base = n_height*0.2;
            // const phi = (1 + Math.sqrt(5)) / 2;

            function f_o_p_on_regular_polygon(nSides, radius, n_it_nor, n_rad_offset) {
                // Calculate the angle between each vertex (in radians)
                let t = n_it_nor;
                t = Math.max(0, Math.min(1, t));
                
                // Total angle for full rotation
                const totalAngle = 2 * Math.PI;
                // Angle per side
                const angleStep = totalAngle / nSides;
                
                // Calculate which edge we're on
                const edgeLength = 1 / nSides;
                const edgeIndex = Math.floor(t / edgeLength);
                const edgeProgress = (t % edgeLength) / edgeLength;
                
                // Calculate angles for current and next vertex
                const angle1 = edgeIndex * angleStep;
                const angle2 = ((edgeIndex + 1) % nSides) * angleStep;
                
                // Get the two vertices
                const x1 = radius * Math.cos(angle1+n_rad_offset);
                const y1 = radius * Math.sin(angle1+n_rad_offset);
                const x2 = radius * Math.cos(angle2+n_rad_offset);
                const y2 = radius * Math.sin(angle2+n_rad_offset);
                
                // Linear interpolation between vertices
                const x = x1 + edgeProgress * (x2 - x1);
                const y = y1 + edgeProgress * (y2 - y1);
                
                return { n_x:x, n_y:y, n_z:0};
        }

            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
            let f_n_len = function(o){
                return Math.sqrt(
                    Math.pow(o.n_x,2)
                    + Math.pow(o.n_y,2)  
                    + Math.pow(o.n_z,2)
                )
            }
            function f_a_o_p(o_trn, n_radius,n_it_layer_nor,n_rad_offset) {
        
                let a_o = new Array(n_its_circle).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_circle = n_it / n_its_circle;
                    let o_p1 = f_o_p_on_regular_polygon(
                        3., 
                        n_radius, 
                        n_it_nor_circle,
                        n_rad_offset
                    );
                    let o_p2 = f_o_p_on_regular_polygon(
                        6., 
                        n_radius, 
                        n_it_nor_circle,
                        n_rad_offset
                    );
                    let nitnor2 = n_it_layer_nor*3.;
                    let nr1 = f_n_len(o_p1);
                    let nr2 = f_n_len(o_p2);
                    let nt = nitnor2%1;
                    nt = Math.sin(nt*n_tau*.5);
                    let nr = nt*nr1 +((1.-nt)*nr2);
                    let o_p = f_o_vec(
                        Math.sin(n_it_nor_circle*n_tau+n_rad_offset)*nr,
                        Math.cos(n_it_nor_circle*n_tau+n_rad_offset)*nr, 
                        0
                    )
                    return f_o_vec(
                        o_trn.n_x + o_p.n_x,
                        o_trn.n_y + o_p.n_y,
                        o_trn.n_z + o_p.n_z,
                    )
        
        
                }).flat();
                return a_o
            }
        

        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let n_radius = n_radius_base//+Math.sin(n_it_layer_nor*n_tau)*n_radius_base*0.6;
                n_radius += Math.sin(n_it_layer_nor*n_tau*0.8)*n_radius_base/2;
        
                let n_rad_offset = n_it_layer_nor*n_tau/n_corners;
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_radius, n_it_layer_nor,n_rad_offset);
                a_o_p_outside.push(...a_o_p);
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_its_circle)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'vase_polygon_circle_interpolated',
        function() {

            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 100.;
            let n_layer_height = 1;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 9.;
            let n_its_subsample = 300.;
            let a_o_p_outside = [];
            let n_radius_base = n_height*0.2;
            // const phi = (1 + Math.sqrt(5)) / 2;

            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
            let f_n_len = function(o){
                return Math.sqrt(
                    Math.pow(o.n_x,2)
                    + Math.pow(o.n_y,2)  
                    + Math.pow(o.n_z,2)
                )
            }
            function f_a_o_p(o_trn, n_corners, n_its_subsample, n_amp, n_rad_offset, n_it_layer_nor) {
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it / n_corners;
                    let a_o_between = []
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        0
                    );
                    let o_trn2 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(((n_it + 1) / n_corners) * n_tau + n_rad_offset) * n_amp,
                        Math.cos(((n_it + 1) / n_corners) * n_tau + n_rad_offset) * n_amp,
                        0
                    );
        
                    const theta_k = (n_it / n_corners) * n_tau + n_rad_offset;
                    const theta_k_plus_1 = ((n_it + 1) / n_corners) * n_tau + n_rad_offset;
        
                    for (let n_it_subsample = 0; n_it_subsample < n_its_subsample; n_it_subsample += 1) {
                        let n_it_nor_subsample = n_it_subsample / n_its_subsample;
                        let n_it_nor_circle = n_it_nor_corner + (n_it_nor_subsample / n_corners)
                        let n_t = n_it_nor_subsample;
                        let o_trn_between = f_o_vec(
                            o_trn1.n_x + (o_trn2.n_x - o_trn1.n_x) * n_t,
                            o_trn1.n_y + (o_trn2.n_y - o_trn1.n_y) * n_t,
                            0
                        );
                        let n_radius_p = Math.sqrt(Math.pow(o_trn_between.n_x, 2) + Math.pow(o_trn_between.n_y, 2));// radius from point between. 
                        let n_radius_c = n_amp;
                        let nt = .1;

                        let n_radius = nt * n_radius_p + (1.-nt)*n_radius_c;
                        // let n_radians_between = 0;// angle between. 
                        let o_pcntr = f_o_vec(
                            n_height/2, 
                            n_radius_base/2, 
                            0
                        );
                        let o_pnow = f_o_vec(
                            n_it_layer_nor*n_height, 
                            n_it_nor_subsample*n_radius_base, 
                            0
                        );
                        let n_dist = f_n_len(
                            f_o_vec(
                            o_pcntr.n_x-o_pnow.n_x,
                            o_pcntr.n_y-o_pnow.n_y,
                            o_pcntr.n_z-o_pnow.n_z,
                            )
                        );
                        let n_distmax = Math.sqrt(
                            Math.pow(n_height/2,2)
                            +Math.pow(n_radius_base/2, 2)
                        )
                        let nd = 1.-(n_dist/n_distmax);
                        n_dist = Math.cos(n_dist*0.5)*(nd*2);

                        // square wave 
                        // https://www.desmos.com/calculator/8yipqfa8ym
                        n_radius += n_dist;
                        // Correct angle interpolation (handles circular wrapping)
                        const sin_avg = (1 - n_t) * Math.sin(theta_k) + n_t * Math.sin(theta_k_plus_1);
                        const cos_avg = (1 - n_t) * Math.cos(theta_k) + n_t * Math.cos(theta_k_plus_1);
                        const theta_interp = Math.atan2(sin_avg, cos_avg);
        
                        let o_trn_between2 = f_o_vec( //this would be the point that is on the corner of the polygon
                            Math.sin(theta_interp + n_rad_offset) * n_radius,
                            Math.cos(theta_interp + n_rad_offset) * n_radius,
                            0
                        );
                        o_trn_between2 = f_o_vec(
                            o_trn.n_x + o_trn_between2.n_x,
                            o_trn.n_y + o_trn_between2.n_y,
                            o_trn.n_z + o_trn_between2.n_z,
                        )
        
                        a_o_between.push(o_trn_between2)
                    }
        
                    return a_o_between
        
        
                }).flat();
                return a_o
            }
        

        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let n_radius = n_radius_base//+Math.sin(n_it_layer_nor*n_tau)*n_radius_base*0.6;
                n_radius += Math.sin(n_it_layer_nor*n_tau*0.8)*n_radius_base/2;
        
                let n_rad_offset = 0;//n_it_layer_nor * (n_tau / n_corners/2);
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_corners, n_its_subsample, n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners * n_its_subsample)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'vase_nine_nipples2',
        function() {

            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 100.;
            let n_layer_height = 1;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 9.;
            let n_its_subsample = 300.;
            let a_o_p_outside = [];
            let n_radius_base = n_height*0.2;
            // const phi = (1 + Math.sqrt(5)) / 2;

            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
            let f_n_len = function(o){
                return Math.sqrt(
                    Math.pow(o.n_x,2)
                    + Math.pow(o.n_y,2)  
                    + Math.pow(o.n_z,2)
                )
            }
            function f_a_o_p(o_trn, n_corners, n_its_subsample, n_amp, n_rad_offset, n_it_layer_nor) {
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it / n_corners;
                    let a_o_between = []
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        0
                    );
                    let o_trn2 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(((n_it + 1) / n_corners) * n_tau + n_rad_offset) * n_amp,
                        Math.cos(((n_it + 1) / n_corners) * n_tau + n_rad_offset) * n_amp,
                        0
                    );
        
                    const theta_k = (n_it / n_corners) * n_tau + n_rad_offset;
                    const theta_k_plus_1 = ((n_it + 1) / n_corners) * n_tau + n_rad_offset;
        
                    for (let n_it_subsample = 0; n_it_subsample < n_its_subsample; n_it_subsample += 1) {
                        let n_it_nor_subsample = n_it_subsample / n_its_subsample;
                        let n_it_nor_circle = n_it_nor_corner + (n_it_nor_subsample / n_corners)
                        let n_t = n_it_nor_subsample;
                        let o_trn_between = f_o_vec(
                            o_trn1.n_x + (o_trn2.n_x - o_trn1.n_x) * n_t,
                            o_trn1.n_y + (o_trn2.n_y - o_trn1.n_y) * n_t,
                            0
                        );
                        let n_radius_p = Math.sqrt(Math.pow(o_trn_between.n_x, 2) + Math.pow(o_trn_between.n_y, 2));// radius from point between. 
                        let n_radius_c = n_amp;
                        let nt = .1;

                        let n_radius = nt * n_radius_p + (1.-nt)*n_radius_c;
                        // let n_radians_between = 0;// angle between. 
                        let o_pcntr = f_o_vec(
                            n_height/2, 
                            n_radius_base/2, 
                            0
                        );
                        let o_pnow = f_o_vec(
                            n_it_layer_nor*n_height, 
                            n_it_nor_subsample*n_radius_base, 
                            0
                        );
                        let n_dist = f_n_len(
                            f_o_vec(
                            o_pcntr.n_x-o_pnow.n_x,
                            o_pcntr.n_y-o_pnow.n_y,
                            o_pcntr.n_z-o_pnow.n_z,
                            )
                        );
                        let n_distmax = Math.sqrt(
                            Math.pow(n_height/2,2)
                            +Math.pow(n_radius_base/2, 2)
                        )
                        let nd = 1.-(n_dist/n_distmax);
                        n_dist = Math.cos(n_dist*0.5)*(nd*2);

                        // square wave 
                        // https://www.desmos.com/calculator/8yipqfa8ym
                        n_radius += n_dist;
                        // Correct angle interpolation (handles circular wrapping)
                        const sin_avg = (1 - n_t) * Math.sin(theta_k) + n_t * Math.sin(theta_k_plus_1);
                        const cos_avg = (1 - n_t) * Math.cos(theta_k) + n_t * Math.cos(theta_k_plus_1);
                        const theta_interp = Math.atan2(sin_avg, cos_avg);
        
                        let o_trn_between2 = f_o_vec( //this would be the point that is on the corner of the polygon
                            Math.sin(theta_interp + n_rad_offset) * n_radius,
                            Math.cos(theta_interp + n_rad_offset) * n_radius,
                            0
                        );
                        o_trn_between2 = f_o_vec(
                            o_trn.n_x + o_trn_between2.n_x,
                            o_trn.n_y + o_trn_between2.n_y,
                            o_trn.n_z + o_trn_between2.n_z,
                        )
        
                        a_o_between.push(o_trn_between2)
                    }
        
                    return a_o_between
        
        
                }).flat();
                return a_o
            }
        

        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let n_radius = n_radius_base//+Math.sin(n_it_layer_nor*n_tau)*n_radius_base*0.6;
                n_radius += Math.sin(n_it_layer_nor*n_tau*0.8)*n_radius_base/2;
        
                let n_rad_offset = 0;//n_it_layer_nor * (n_tau / n_corners/2);
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_corners, n_its_subsample, n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners * n_its_subsample)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'vase_nine_nipples', 
        function() {

            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 100.;
            let n_layer_height = 1;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 9.;
            let n_its_subsample = 300.;
            let a_o_p_outside = [];
            let n_radius_base = n_height/1.618;
            // const phi = (1 + Math.sqrt(5)) / 2;

            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
            let f_n_len = function(o){
                return Math.sqrt(
                    Math.pow(o.n_x,2)
                    + Math.pow(o.n_y,2)  
                    + Math.pow(o.n_z,2)
                )
            }
            function f_a_o_p(o_trn, n_corners, n_its_subsample, n_amp, n_rad_offset, n_it_layer_nor) {
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it / n_corners;
                    let a_o_between = []
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        0
                    );
                    let o_trn2 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(((n_it + 1) / n_corners) * n_tau + n_rad_offset) * n_amp,
                        Math.cos(((n_it + 1) / n_corners) * n_tau + n_rad_offset) * n_amp,
                        0
                    );
        
                    const theta_k = (n_it / n_corners) * n_tau + n_rad_offset;
                    const theta_k_plus_1 = ((n_it + 1) / n_corners) * n_tau + n_rad_offset;
        
                    for (let n_it_subsample = 0; n_it_subsample < n_its_subsample; n_it_subsample += 1) {
                        let n_it_nor_subsample = n_it_subsample / n_its_subsample;
                        let n_it_nor_circle = n_it_nor_corner + (n_it_nor_subsample / n_corners)
                        let n_t = n_it_nor_subsample;
                        let o_trn_between = f_o_vec(
                            o_trn1.n_x + (o_trn2.n_x - o_trn1.n_x) * n_t,
                            o_trn1.n_y + (o_trn2.n_y - o_trn1.n_y) * n_t,
                            0
                        );
                        let n_radius = Math.sqrt(Math.pow(o_trn_between.n_x, 2) + Math.pow(o_trn_between.n_y, 2));// radius from point between. 
                        // let n_radians_between = 0;// angle between. 
                        let o_pcntr = f_o_vec(
                            n_height/2, 
                            n_radius_base/2, 
                            0
                        );
                        let o_pnow = f_o_vec(
                            n_it_layer_nor*n_height, 
                            n_it_nor_subsample*n_radius_base, 
                            0
                        );
                        let n_dist = f_n_len(
                            f_o_vec(
                            o_pcntr.n_x-o_pnow.n_x,
                            o_pcntr.n_y-o_pnow.n_y,
                            o_pcntr.n_z-o_pnow.n_z,
                            )
                        );
                        let n_distmax = Math.sqrt(
                            Math.pow(n_height/2,2)
                            +Math.pow(n_radius_base/2, 2)
                        )
                        let nd = 1.-(n_dist/n_distmax);
                        n_dist = Math.sin(n_dist*0.3)*(nd*2);

                        // square wave 
                        // https://www.desmos.com/calculator/8yipqfa8ym
                        n_radius += n_dist;
                        // Correct angle interpolation (handles circular wrapping)
                        const sin_avg = (1 - n_t) * Math.sin(theta_k) + n_t * Math.sin(theta_k_plus_1);
                        const cos_avg = (1 - n_t) * Math.cos(theta_k) + n_t * Math.cos(theta_k_plus_1);
                        const theta_interp = Math.atan2(sin_avg, cos_avg);
        
                        let o_trn_between2 = f_o_vec( //this would be the point that is on the corner of the polygon
                            Math.sin(theta_interp + n_rad_offset) * n_radius,
                            Math.cos(theta_interp + n_rad_offset) * n_radius,
                            0
                        );
                        o_trn_between2 = f_o_vec(
                            o_trn.n_x + o_trn_between2.n_x,
                            o_trn.n_y + o_trn_between2.n_y,
                            o_trn.n_z + o_trn_between2.n_z,
                        )
        
                        a_o_between.push(o_trn_between2)
                    }
        
                    return a_o_between
        
        
                }).flat();
                return a_o
            }
        

        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let n_radius = n_radius_base//+Math.sin(n_it_layer_nor*n_tau)*n_radius_base*0.6;
                n_radius += Math.sin(n_it_layer_nor*n_tau*0.8)*20;
        
                let n_rad_offset = 0;//n_it_layer_nor * (n_tau / n_corners/2);
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_corners, n_its_subsample, n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners * n_its_subsample)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'square_vase', 
        function() {

            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
        
            function f_a_o_p(o_trn, n_corners, n_its_subsample, n_amp, n_rad_offset, n_it_layer_nor) {
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it / n_corners;
                    let a_o_between = []
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * n_amp,
                        0
                    );
                    let o_trn2 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(((n_it + 1) / n_corners) * n_tau + n_rad_offset) * n_amp,
                        Math.cos(((n_it + 1) / n_corners) * n_tau + n_rad_offset) * n_amp,
                        0
                    );
        
                    const theta_k = (n_it / n_corners) * n_tau + n_rad_offset;
                    const theta_k_plus_1 = ((n_it + 1) / n_corners) * n_tau + n_rad_offset;
        
                    for (let n_it_subsample = 0; n_it_subsample < n_its_subsample; n_it_subsample += 1) {
                        let n_it_nor_subsample = n_it_subsample / n_its_subsample;
                        let n_it_nor_circle = n_it_nor_corner + (n_it_nor_subsample / n_corners)
                        let n_t = n_it_nor_subsample;
                        let o_trn_between = f_o_vec(
                            o_trn1.n_x + (o_trn2.n_x - o_trn1.n_x) * n_t,
                            o_trn1.n_y + (o_trn2.n_y - o_trn1.n_y) * n_t,
                            0
                        );
                        let n_radius = Math.sqrt(Math.pow(o_trn_between.n_x, 2) + Math.pow(o_trn_between.n_y, 2));// radius from point between. 
                        // let n_radians_between = 0;// angle between. 
        
                        // square wave 
                        // https://www.desmos.com/calculator/8yipqfa8ym
                        let n_square_wave = 0.;
                        let n_its_sw = 200.;
                        let n_its_wave = 10*4.;
                        let nx = n_it_nor_circle * n_its_wave * n_tau;
                        nx+= n_tau/4;
                        for (let n_it_sw = 0.; n_it_sw < n_its_sw; n_it_sw += 1) {
                            let n = (n_it_sw * 2) + 1;
                            n_square_wave += (1. / n) * Math.sin(n * nx);
                        }
                        let nx2 = n_it_nor_subsample;
                        let n_amp = Math.sin(nx2*n_tau/2);
                        n_radius += n_square_wave *10*n_amp;
        
                        // Correct angle interpolation (handles circular wrapping)
                        const sin_avg = (1 - n_t) * Math.sin(theta_k) + n_t * Math.sin(theta_k_plus_1);
                        const cos_avg = (1 - n_t) * Math.cos(theta_k) + n_t * Math.cos(theta_k_plus_1);
                        const theta_interp = Math.atan2(sin_avg, cos_avg);
        
                        let o_trn_between2 = f_o_vec( //this would be the point that is on the corner of the polygon
                            Math.sin(theta_interp + n_rad_offset) * n_radius,
                            Math.cos(theta_interp + n_rad_offset) * n_radius,
                            0
                        );
                        o_trn_between2 = f_o_vec(
                            o_trn.n_x + o_trn_between2.n_x,
                            o_trn.n_y + o_trn_between2.n_y,
                            o_trn.n_z + o_trn_between2.n_z,
                        )
        
                        a_o_between.push(o_trn_between2)
                    }
        
                    return a_o_between
        
        
                }).flat();
                return a_o
            }
        
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 100.;
            let n_layer_height = 1;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 4.;
            let n_its_subsample = 300.;
            let a_o_p_outside = [];
            let n_radius_base = n_height/1.618;
            // const phi = (1 + Math.sqrt(5)) / 2;
        
        
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let n_radius = n_radius_base//+Math.sin(n_it_layer_nor*n_tau)*n_radius_base*0.6;
                //n_radius += Math.sin(n_it_layer_nor*n_tau*6)*0.2;
        
                let n_rad_offset = n_it_layer_nor * (n_tau / n_corners/2);
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_corners, n_its_subsample, n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners * n_its_subsample)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'vase_twisted_trinity_tidal', 
        function() {
            noise.seed(Math.random());

            let n_its_wave = 12.;
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
        
            function f_a_o_p(o_trn, n_corners, n_amp, n_rad_offset, n_it_layer_nor) {
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it / n_corners;

                    let na = n_amp;
                    let n_x = Math.sin(n_it_nor_corner * n_tau + n_rad_offset);
                    let n_y = Math.cos(n_it_nor_corner * n_tau + n_rad_offset);

                    //lets introduce some symetry // wtf was bini fürne autist dassi dass efach so cha
                    let nic = (Math.sin(n_it_nor_corner*n_tau*3.)*.5+.5)*.2;
                    let n_x2 = Math.sin(nic * n_tau + n_rad_offset);
                    let n_y2 = Math.cos(nic * n_tau + n_rad_offset);

        
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        n_x * na,
                        n_y * na,
                        0
                    );

                   
                    let n_noise_layer = noise.simplex2(
                        (n_x2+n_it_layer_nor)*2,
                        (n_y2+n_it_layer_nor)*1.9, 
                        0.5
                    );
                    let np2 = noise.simplex2(
                        (Math.sin(n_it_nor_corner * n_tau))*0.1,
                        (Math.cos(n_it_nor_corner * n_tau))*0.1, 
                        0.5
                    );
                    n_noise_layer = (n_noise_layer +1)*.5;// from -1 to 1, to 0. to 1.0

                    na = n_amp+n_noise_layer*n_amp*.5;
                    o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon        
                        Math.sin((n_it_nor_corner+np2*0.02) * n_tau + n_rad_offset) * na,
                        Math.cos((n_it_nor_corner+np2*0.02) * n_tau + n_rad_offset) * na,
                        0
                    );

                    o_trn1 = f_o_vec(
                        o_trn.n_x + o_trn1.n_x,
                        o_trn.n_y + o_trn1.n_y,
                        o_trn.n_z + o_trn1.n_z,
                    )
        
                    return o_trn1
        
        
                }).flat();
        
                return a_o
            }
        
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 200.;
            let n_layer_height = 0.6;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 500.;
            let a_o_p_outside = [];
            let n_radius_base = 50;
            // const phi = (1 + Math.sqrt(5)) / 2;
            
            //https://www.desmos.com/calculator/9jw5utw0fa
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let ne = 2.71828;
                let x = n_it_layer_nor;
                let no = Math.pow(ne, -5 * x) * Math.sin(x * 0.1) * 20;
                let n_radius = n_radius_base+Math.sin(n_it_layer_nor*n_tau*3.)*10;
                let n_rad_offset = n_it_layer_nor * n_tau /3
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_corners, n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
        
        
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
        
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'vase_noise',
        function() {
            noise.seed(Math.random());

            let n_its_wave = 12.;
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
        
            function f_a_o_p(o_trn, n_corners, n_amp, n_rad_offset, n_it_layer_nor) {
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it / n_corners;

                    let na = n_amp;
                    let n_x = Math.sin(n_it_nor_corner * n_tau + n_rad_offset);
                    let n_y = Math.cos(n_it_nor_corner * n_tau + n_rad_offset);

                    //lets introduce some symetry // wtf was bini fürne autist dassi dass efach so cha
                    let nic = (Math.sin(n_it_nor_corner*n_tau*3.)*.5+.5)*.3;
                    let n_x2 = Math.sin(nic * n_tau + n_rad_offset);
                    let n_y2 = Math.cos(nic * n_tau + n_rad_offset);

        
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        n_x * na,
                        n_y * na,
                        0
                    );

                   
                    let n_noise_layer = noise.simplex2(
                        (n_x2+n_it_layer_nor)*1.2,
                        (n_y2+n_it_layer_nor)*1.2
                    );
                    n_noise_layer = (n_noise_layer + 1)*.5;// from -1 to 1, to 0. to 1.0

                    na = n_amp+n_noise_layer*n_amp*.5;
                    o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon        
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * na,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * na,
                        0
                    );

                    o_trn1 = f_o_vec(
                        o_trn.n_x + o_trn1.n_x,
                        o_trn.n_y + o_trn1.n_y,
                        o_trn.n_z + o_trn1.n_z,
                    )
        
                    return o_trn1
        
        
                }).flat();
        
                return a_o
            }
        
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 200.;
            let n_layer_height = 0.6;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 300.;
            let a_o_p_outside = [];
            let n_radius_base = 50;
            // const phi = (1 + Math.sqrt(5)) / 2;
            
            //https://www.desmos.com/calculator/9jw5utw0fa
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let ne = 2.71828;
                let x = n_it_layer_nor;
                let no = Math.pow(ne, -5 * x) * Math.sin(x * 0.1) * 20;
                let n_radius = n_radius_base+Math.sin(n_it_layer_nor*n_tau*0.8)*20;
                let n_rad_offset = n_it_layer_nor * (n_tau / n_corners / 2);
                n_rad_offset = 0;
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_corners, n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
        
        
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
        
                }
            }
        
            a_o_geometry.push(  
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'vase_bold',
        function() {

            let n_its_wave = 12.;
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
        
            function f_a_o_p(o_trn, n_corners, n_amp, n_rad_offset, n_it_layer_nor) {
        
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it / n_corners;
                    let nx = n_it_layer_nor*n_it_layer_nor;
                    let a2 = Math.sin(nx * 40. * n_tau) * 0.2;
                    let h = Math.sin(n_it_nor_corner * n_tau * 33) * 0.02 * a2;
                    // https://www.desmos.com/calculator/mlhhw6p2du
                    let na = n_amp+h*100;
        
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner * n_tau + n_rad_offset) * na,
                        Math.cos(n_it_nor_corner * n_tau + n_rad_offset) * na,
                        0
                    );
        
                    o_trn1 = f_o_vec(
                        o_trn.n_x + o_trn1.n_x,
                        o_trn.n_y + o_trn1.n_y,
                        o_trn.n_z + o_trn1.n_z,
                    )
        
                    return o_trn1
        
        
                }).flat();
        
                return a_o
            }
        
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 200.;
            let n_layer_height = 0.6;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 300.;
            let a_o_p_outside = [];
            let n_radius_base = 20;
            // const phi = (1 + Math.sqrt(5)) / 2;
        
            //https://www.desmos.com/calculator/9jw5utw0fa
            for (let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer += 1) {
                let n_it_layer_nor = n_it_layer / n_its_layer;
                let n_z = n_it_layer * n_layer_height;
                let n_radius = n_radius_base;
                let ne = 2.71828;
                let x = n_it_layer_nor;
                let no = Math.pow(ne, -5 * x) * Math.sin(x * 0.1) * 20;
        
                // e^{-2x}\cdot\sin\left(x+0.1\cdot2\right)\cdot1.2
                n_radius += no*200;
                let n_rad_offset = n_it_layer_nor * (n_tau / n_corners / 2);
                n_rad_offset = 0;
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z), n_corners, n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
        
        
                if (n_it_layer == 0 || n_it_layer == n_its_layer - 1) {
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, n_z), ...a_o_p])
                    )
        
                }
            }
        
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o => { return f_o_shaded_mesh(o) })
        
            return a_o_mesh
        }
    ),
    f_o_function(
        'in_the_works',
        function(){
            
            let n_its_wave = 12.;
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
    
            function f_a_o_p(o_trn, n_corners, n_amp, n_rad_offset, n_it_layer_nor) {
    
                let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it/n_corners;
    
                    let x = (n_it_nor_corner*n_its_wave)%1.;
                    let w = (Math.sin(n_it_layer_nor*n_tau*3.)*.5+.5)*0.3+0.1;
                    let l = x+w;
                    let k = x-w;

                    let a = Math.pow(l,2);
                    let b = Math.pow(l-1, 2);
                    let c = Math.min(a,b);
                    let d = Math.pow(k,2);
                    let g = Math.pow(k-1, 2);
                    let f = Math.min(d,g);
                    let h = Math.max(c,f);
                    

                    // https://www.desmos.com/calculator/mlhhw6p2du
                    let na = n_amp+h*50;
    
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner*n_tau+n_rad_offset)*na,
                        Math.cos(n_it_nor_corner*n_tau+n_rad_offset)*na,
                        0
                    ); 
    
                    o_trn1 = f_o_vec(
                        o_trn.n_x+o_trn1.n_x,
                        o_trn.n_y+o_trn1.n_y,
                        o_trn.n_z+o_trn1.n_z,
                    )
                    
                    return o_trn1
    
    
                }).flat();
    
                return a_o
            }
    
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 200.;
            let n_layer_height = 10.6;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 300.;
            let a_o_p_outside = [];
            let n_radius_base = n_height/3;
            // const phi = (1 + Math.sqrt(5)) / 2;
    
    
            for(let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer+=1){
                let n_it_layer_nor = n_it_layer/n_its_layer;
                let n_z = n_it_layer*n_layer_height;
                let n_radius = n_radius_base;
                n_radius+=Math.sin(n_it_layer_nor*n_tau*0.8)*20;
                
                let n_rad_offset = n_it_layer_nor*(n_tau/n_corners/2);
                n_rad_offset += n_it_layer_nor*n_tau*(1./n_its_wave);
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z),n_corners,n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
    
    
                if(n_it_layer == 0 || n_it_layer == n_its_layer-1){
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0,0,n_z),...a_o_p])
                    )
    
                }
            }
    
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o=>{return f_o_shaded_mesh(o)})
            
            return a_o_mesh
        }
    ),
    f_o_function(
        'its a BOWL!', 
        function(){
            
            let n_its_wave = 12.;
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }
    
            function f_a_o_p(o_trn, n_corners, n_amp, n_rad_offset, n_it_layer_nor) {
    
                let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it/n_corners;
    
                    let n_x = (n_it_nor_corner*n_its_wave)%1.;
                    let a = Math.pow(n_x,2);
                    let b = Math.pow(n_x-1, 2);
                    let c = Math.min(a,b);
                    let na = n_amp+c*50.;
    
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner*n_tau+n_rad_offset)*na,
                        Math.cos(n_it_nor_corner*n_tau+n_rad_offset)*na,
                        0
                    ); 
    
                    o_trn1 = f_o_vec(
                        o_trn.n_x+o_trn1.n_x,
                        o_trn.n_y+o_trn1.n_y,
                        o_trn.n_z+o_trn1.n_z,
                    )
                    
                    return o_trn1
    
    
                }).flat();
    
                return a_o
            }
    
            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 200.;
            let n_layer_height = 10.6;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 300.;
            let a_o_p_outside = [];
            let n_radius_base = n_height/3;
            // const phi = (1 + Math.sqrt(5)) / 2;
    
    
            for(let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer+=1){
                let n_it_layer_nor = n_it_layer/n_its_layer;
                let n_z = n_it_layer*n_layer_height;
                let n_radius = n_radius_base;
                let n_expo = 1-Math.pow(n_it_layer_nor-1,2);
                n_radius += n_expo*100;
                let n_rad_offset = n_it_layer_nor*(n_tau/n_corners/2);
                n_rad_offset += n_it_layer_nor*n_tau*(1./n_its_wave);
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z),n_corners,n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
    
    
                if(n_it_layer == 0 || n_it_layer == n_its_layer-1){
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0,0,n_z),...a_o_p])
                    )
    
                }
            }
    
            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o=>{return f_o_shaded_mesh(o)})
            
            return a_o_mesh
        }
    ),
    f_o_function(
        'example_vase_with_layers', 
        function(){
            // let ov = f_ov({
            //     n_its: {n_min: 3, n_max: 10, n: 10},
            //     n_amp: 20,
            // });
            let n_tau = Math.PI*2;
            let n_layer_height_mm = 0.2/2.;///2. for more precision, subsampling
            let n_radius_bottom = 28.; 
            let n_radius_top = 30.;
            let n_height = 60.;
            let n_corners = 5.;
            let n_its = n_height / n_layer_height_mm;
            let a_o = [
                ...new Array(n_its).fill(0).map(
                    (n, n_idx)=>{
                        let n_it = parseFloat(n_idx)
                        let n_it_nor = n_it/n_its;
                        let n_rotation_radians = n_it_nor*n_tau/5;
                        return f_o_reg_poly(
                            f_o_vec(0,0,n_it*n_layer_height_mm),
                            n_rotation_radians,
                            n_radius_bottom
                                +(n_it_nor*(n_radius_top-n_radius_bottom)),
                            n_corners,
                            n_layer_height_mm 
                        )
                    }
                )
            ]
            return a_o

        }
    ),
    f_o_function(
        'convex_hull_algo', 
        function(){
            // this is an example for a shape that is made  of random points, only the vertices on the convex hull is taken
            let n_tau = Math.PI*2;
            let n_radius_base = 30.;
            let a_o_p = [
                // a flat base layer 
                ...new Array(100).fill(0).map(
                    (v, n_idx)=>{
                        let n_it = parseInt(n_idx);
                        let n_it_nor = n_it / 100.;
                        return f_o_vec(
                            Math.sin(n_it_nor*n_tau)*n_radius_base, 
                            Math.cos(n_it_nor*n_tau)*n_radius_base,
                            0//zero for base layer
                        )
                    }
                ),
                //random points
                ...new Array(100).fill(0).map(
                    (n, n_idx)=>{
                        return f_o_vec(
                            (Math.random()-.5)*50,
                            (Math.random()-.5)*50,
                            (Math.random())*50,
                        )
                    }
                )
            ].flat()
            const a_ovec = a_o_p.map(o => new THREE.Vector3(o.n_x, o.n_y, o.n_z));            
            const geometry = new ConvexGeometry(a_ovec);
            return [f_o_shaded_mesh(geometry)];
        }
    ),
    f_o_function(
        'cubes_example', 
        function(){
            // this is an example for a shape that is made  of random points, only the vertices on the convex hull is taken
            let n_tau = Math.PI*2;
            let n_radius_base = 30.;
            let n_layers = 20;
            let n_cubes = 20;
            let n_amp = 10.;
            let n_height = 100;
            let a_o = [
                // a flat base layer 
                ...new Array(n_layers).fill(0).map(
                    (v, n_idx)=>{
                        let n_it = parseInt(n_idx);
                        let n_it_nor = n_it / n_layers;
                        return new Array(n_cubes).fill(0).map(
                            (v, n_idx)=>{
                                let n_it2 = parseInt(n_idx);
                                let n_it_nor2 = n_it2 / n_cubes;
                                let o_box = new THREE.BoxGeometry( 4,4,4); 
                                
                                let o_mesh = f_o_shaded_mesh(o_box);
                                o_mesh.position.set(
                                    Math.sin(n_tau*n_it_nor2)*n_amp,
                                    Math.cos(n_tau*n_it_nor2)*n_amp,
                                    n_it_nor*n_height
                                )
                                o_mesh.rotation.set(
                                    n_tau*n_it_nor2,
                                    0,
                                    0,
                                    // Math.random(),
                                    // Math.random(),
                                    // Math.random(),
                                )
                                return o_mesh
                            }
                        )
                    }
                ).flat(),
            ].flat()
            // Create cylinder geometry
            const geometry = new THREE.CylinderGeometry(
                n_amp,     // radiusTop
                n_amp,     // radiusBottom
                n_height,     // height
                32     // radialSegments (smoothness)
            );
            let o_cylinder = f_o_shaded_mesh(geometry);
            o_cylinder.rotation.set(n_tau/4,0,0)
            o_cylinder.position.set(0,0,n_height/2);
            globalThis.o_cylinder = o_cylinder
            a_o.push(o_cylinder)
            return a_o
        }
    ),
    f_o_function(
        'star_polygon', 
        function(){
            let f_o_extruded_mesh = function(a_o_p, n_extrusion){
                const a_o_point = a_o_p.map(o => new THREE.Vector3(o.n_x, o.n_y, o.n_z));
                const o_shape = new THREE.Shape(a_o_point);
                const extrudeSettings = {
                    depth: n_extrusion, // 0.2mm extrusion
                    bevelEnabled: false // No bevel for simple extrusion
                };
                const geometry = new THREE.ExtrudeGeometry(o_shape, extrudeSettings);
                const mesh = f_o_shaded_mesh(geometry);
                return mesh
            }
            let f_a_o_reg_poly_star = function(
                o_trn,
                n_corners, 
                n_radius_1, 
                n_radius_2,
                n_rad_offset
            ){
                let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                    let n_it = parseFloat(n_idx);
                    let n_it_nor = n_it/n_corners;
                    let n_amp = (n_it%2==0)?n_radius_1: n_radius_2; 
                    let o_trn2 = f_o_vec(
                        Math.sin(n_tau*n_it_nor+n_rad_offset)*n_amp,
                        Math.cos(n_tau*n_it_nor+n_rad_offset)*n_amp,
                        0,
                    )
                    return f_o_vec(
                        o_trn.n_x+o_trn2.n_x,
                        o_trn.n_y+o_trn2.n_y,
                        o_trn.n_z+o_trn2.n_z,
                    );
                });
                return a_o
            }
            let n_tau = Math.PI*2;
            let n_layer_height_mm = 0.2/2.;///2. for more precision, subsampling
            let n_height = 120.;
            let n_corners = 60.;
            let n_radius_1 = 100.;
            let n_radius_2 = 120.;
            let n_its = n_height / n_layer_height_mm;
            let a_o = [
                ...new Array(n_its).fill(0).map(
                    (n, n_idx)=>{
                        let n_it = parseFloat(n_idx)
                        let n_it_nor = n_it/n_its;
                        let n_amp_radius = (Math.cos(n_it_nor*.5*n_tau+(n_tau*0.8))*.5+.5)*0.3+0.2
                        let a_o_p = f_a_o_reg_poly_star(
                            f_o_vec(0,0,0),
                            n_corners, 
                            n_radius_1*n_amp_radius, 
                            n_radius_2*n_amp_radius, 
                            0
                        );
                        let o_mesh = f_o_extruded_mesh(
                            a_o_p, 
                            n_layer_height_mm
                        )
                        o_mesh.rotation.set(0,0,n_it_nor*n_tau*0.2)
                        o_mesh.position.set(0,0,n_it*n_layer_height_mm);
                        return o_mesh
                    }
                )
            ]
            return a_o
        }
    ),
    f_o_function(
        'curve_test', 
        function(){

            let f_o_extruded_mesh_curvepoints = function(a_o_p, n_extrusion, n_points_per_circle){
                const a_ovec = a_o_p.map(o => new THREE.Vector3(o.n_x, o.n_y, o.n_z)); 
                const curve = new THREE.CatmullRomCurve3(a_ovec);
                curve.curveType = 'centripetal'; // Creates smoother curves
                curve.closed = true; // Important for closed loops
    
                // Get points from the curve
                const points = curve.getPoints(n_points_per_circle);
    
                // Create a shape from these points
                const shape = new THREE.Shape(points);
    
                // Extrude the shape vertically (creates a flat disc with thickness)
                const extrudeSettings = {
                    depth: n_extrusion,          // thickness of the disc
                    bevelEnabled: false // no bevel for simple disc
                };
                
                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

                return f_o_shaded_mesh(geometry);
            }

            let f_a_o_p_rand = function(
                n_corners, 
                n_radius, 
                n_radius_plus_minus_random
            ){

                let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                    let n_tau = Math.PI*2
                    let n_radius_random = n_radius + (Math.random()-.5)*n_radius_plus_minus_random;
                    let n_it_nor = parseFloat(n_idx)/n_corners;
                    let o_trn2 = f_o_vec(
                        Math.sin(n_tau*n_it_nor)*n_radius_random,
                        Math.cos(n_tau*n_it_nor)*n_radius_random,
                        0,
                    )
                    return f_o_vec(
                        o_trn2.n_x,
                        o_trn2.n_y,
                        o_trn2.n_z,
                    );
                });
                return a_o
            }
            let n_points = 100;
            let n_radius = 50;
            let n_height = 100;

            let a_o_p_rand = f_a_o_p_rand(
                n_points,
                n_radius,
                3
            );
            let n_tau = Math.PI*2;
            let n_layer_height_mm = 0.2/2.;///2. for more precision, subsampling
            let n_corners = 5.;
            let n_its = n_height / n_layer_height_mm;

            let a_o_mesh = new Array(n_its).fill(0).map((v, n_idx)=>{
                let n_it = parseInt(n_idx);
                let n_it_nor = n_it / n_its;

                let a_o_p = a_o_p_rand.map((o, n_idx)=>{
                    let n = parseInt(n_idx);
                    let n_nor = n/n_points;
                    let n_radius = Math.sqrt(Math.pow(o.n_x,2) + Math.pow(o.n_y,2) + Math.pow(o.n_y,2));
                    let n_radius_offset = Math.sin(n_it_nor*n_tau*3.)*3;
                    let n_radians = Math.atan2(o.n_y, o.n_x);
                    let n_rot = n_it_nor * n_tau/2
                    return f_o_vec(
                        Math.sin(n_radians+n_rot)*(n_radius+n_radius_offset), 
                        Math.cos(n_radians+n_rot)*(n_radius+n_radius_offset), 
                        0
                    );
                });
                let o_mesh = f_o_extruded_mesh_curvepoints(a_o_p, n_layer_height_mm, n_points);
                o_mesh.position.set(0,0,n_it*n_layer_height_mm);
                return o_mesh
            })

            return a_o_mesh
        }
    ),
    f_o_function(
        'canyon', 
        function(){

            let f_o_extruded_mesh_curvepoints = function(a_o_p, n_extrusion, n_points_per_circle){
                const a_ovec = a_o_p.map(o => new THREE.Vector3(o.n_x, o.n_y, o.n_z)); 
                const curve = new THREE.CatmullRomCurve3(a_ovec);
                curve.curveType = 'centripetal'; // Creates smoother curves
                curve.closed = true; // Important for closed loops
    
                // Get points from the curve
                const points = curve.getPoints(n_points_per_circle);
    
                // Create a shape from these points
                const shape = new THREE.Shape(points);
    
                // Extrude the shape vertically (creates a flat disc with thickness)
                const extrudeSettings = {
                    depth: n_extrusion,          // thickness of the disc
                    bevelEnabled: false // no bevel for simple disc
                };
                
                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

                return f_o_shaded_mesh(geometry);
            }

            let f_a_o_p_circles = function(
                n_corners, 
                n_radius, 
                n_radius_plus_minus_random
            ){

                let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                    let n_it = parseInt(n_idx);
                    let n_it_nor = n_it/ n_corners;
                    let n_tau = Math.PI*2
                    let n_radius_random = n_radius + Math.sin(n_it_nor*n_tau*4.)*n_radius_plus_minus_random; 
                    let o_trn2 = f_o_vec(
                        Math.sin(n_tau*n_it_nor)*n_radius_random,
                        Math.cos(n_tau*n_it_nor)*n_radius_random,
                        0,
                    )
                    return f_o_vec(
                        o_trn2.n_x,
                        o_trn2.n_y,
                        o_trn2.n_z,
                    );
                });
                return a_o
            }
            let n_points = 100;
            let n_radius = 50;
            let n_height = 100;

            let a_o_p1 = f_a_o_p_circles(
                n_points,
                n_radius,
                3
            );
            let n_tau = Math.PI*2;
            let n_layer_height_mm = 0.2;///2. for more precision, subsampling
            let n_corners = 5.;
            let n_its = n_height / n_layer_height_mm;

            let a_o_mesh = new Array(n_its).fill(0).map((v, n_idx)=>{
                let n_it = parseInt(n_idx);
                let n_it_nor = n_it / n_its;

                let a_o_p = a_o_p1.map((o, n_idx)=>{
                    let n = parseInt(n_idx);
                    let n_nor = n/n_points;
                    let n_radius = Math.sqrt(Math.pow(o.n_x,2) + Math.pow(o.n_y,2) + Math.pow(o.n_y,2));
                    let n_radius_offset = Math.sin(n_it_nor*n_tau*3.)*3;
                    let n_radians = Math.atan2(o.n_y, o.n_x);
                    let n_rot = n_it_nor * n_tau/2
                    return f_o_vec(
                        Math.sin(n_radians+n_rot)*(n_radius+n_radius_offset), 
                        Math.cos(n_radians+n_rot)*(n_radius+n_radius_offset), 
                        0
                    );
                });
                let o_mesh = f_o_extruded_mesh_curvepoints(a_o_p, n_layer_height_mm, n_points);
                o_mesh.position.set(0,0,n_it*n_layer_height_mm);
                return o_mesh
            })

            return a_o_mesh
        }
    ),
    f_o_function(
        'circles_extruded', 
        function(){


            let f_o_extruded_mesh_curvepoints = function(a_o_p, n_extrusion, n_points_per_circle){
                // Convert to 2D points first
                const a_points_2d = a_o_p.map(o => new THREE.Vector2(o.n_x, o.n_y));
                
                // Create shape directly from 2D points
                const shape = new THREE.Shape(a_points_2d);
                
                const extrudeSettings = {
                    depth: n_extrusion,
                    bevelEnabled: false,
                    steps: 1,
                    curveSegments: n_points_per_circle
                };
                
                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                return f_o_shaded_mesh(geometry);
            }

            let f_a_o_p_circles = function(
                n_corners, 
                n_radius, 
                n_radius_plus_minus_random, 
                n_freq
            ){

                let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                    let n_it = parseInt(n_idx);
                    let n_it_nor = n_it/ n_corners;
                    let n_tau = Math.PI*2
                    let n_radius_random = n_radius + Math.sin(n_it_nor*n_tau*n_freq)*n_radius_plus_minus_random; 
                    let o_trn2 = f_o_vec(
                        Math.sin(n_tau*n_it_nor)*n_radius_random,
                        Math.cos(n_tau*n_it_nor)*n_radius_random,
                        0,
                    )
                    return f_o_vec(
                        o_trn2.n_x,
                        o_trn2.n_y,
                        o_trn2.n_z,
                    );
                });
                return a_o
            }

            let n_corners = 1000;
            let n_radius = 50;
            let n_radius_plus_minus = 5;
            let n_extrusion = 20;
            let n_freq = 10;

            return [
                f_o_extruded_mesh_curvepoints(
                    f_a_o_p_circles(n_corners, n_radius, n_radius_plus_minus,n_freq),
                    n_extrusion,
                    n_corners
                )
            ]
            // let n_points = 100;
            // let n_radius = 50;
            // let n_height = 100;

            // let a_o_p1 = f_a_o_p_circles(
            //     n_points,
            //     n_radius,
            //     3
            // );
            // let n_tau = Math.PI*2;
            // let n_layer_height_mm = 0.2;///2. for more precision, subsampling
            // let n_corners = 5.;
            // let n_its = n_height / n_layer_height_mm;

            // let a_o_mesh = new Array(n_its).fill(0).map((v, n_idx)=>{
            //     let n_it = parseInt(n_idx);
            //     let n_it_nor = n_it / n_its;

            //     let a_o_p = a_o_p1.map((o, n_idx)=>{
            //         let n = parseInt(n_idx);
            //         let n_nor = n/n_points;
            //         let n_radius = Math.sqrt(Math.pow(o.n_x,2) + Math.pow(o.n_y,2) + Math.pow(o.n_y,2));
            //         let n_radius_offset = Math.sin(n_it_nor*n_tau*3.)*3;
            //         let n_radians = Math.atan2(o.n_y, o.n_x);
            //         let n_rot = n_it_nor * n_tau/2
            //         return f_o_vec(
            //             Math.sin(n_radians+n_rot)*(n_radius+n_radius_offset), 
            //             Math.cos(n_radians+n_rot)*(n_radius+n_radius_offset), 
            //             0
            //         );
            //     });
            //     let o_mesh = f_o_extruded_mesh_curvepoints(a_o_p, n_layer_height_mm, n_points);
            //     o_mesh.position.set(0,0,n_it*n_layer_height_mm);
            //     return o_mesh
            // })

            // return a_o_mesh
        }
    ),
    f_o_function(
        'fancy_vase', 
        function(){

            let f_o_extruded_mesh_curvepoints = function(a_o_p, n_extrusion, n_points_per_circle){
                // Convert to 2D points first
                const a_points_2d = a_o_p.map(o => new THREE.Vector2(o.n_x, o.n_y));
                
                // Create shape directly from 2D points
                const shape = new THREE.Shape(a_points_2d);
                
                const extrudeSettings = {
                    depth: n_extrusion,
                    bevelEnabled: false,
                    steps: 1,
                    curveSegments: n_points_per_circle
                };
                
                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                return f_o_shaded_mesh(geometry);
            }

            let f_a_o_p_circles = function(
                n_corners, 
                n_radius, 
                n_sin_amp, 
                n_freq,
                n_freq_offset
             ){

                let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                    let n_it = parseInt(n_idx);
                    let n_it_nor = n_it/ n_corners;
                    let n_tau = Math.PI*2
                    let n_radius_random = n_radius + Math.sin(n_it_nor*n_tau*n_freq)*n_sin_amp; 
                    let o_trn2 = f_o_vec(
                        Math.sin(n_tau*n_it_nor+n_freq_offset)*n_radius_random,
                        Math.cos(n_tau*n_it_nor+n_freq_offset)*n_radius_random,
                        0,
                    )
                    return f_o_vec(
                        o_trn2.n_x,
                        o_trn2.n_y,
                        o_trn2.n_z,
                    );
                });
                return a_o
            }

            let n_corners = 500;
            let n_radius = 50;
            let n_radius_plus_minus = 5;
            let n_extrusion = 20;
            let n_freq = 20;

            let n_height = 100.;
            let n_layer_height_mm = .2;
            let n_its = n_height / n_layer_height_mm;
            let a_o_mesh = new Array(n_its).fill(0).map((v, n_idx)=>{
                let n_it = parseInt(n_idx);
                let n_it_nor = n_it / n_its;
                let n_sin_amp = (1.-n_it_nor)*10; 
                let n_grow = (1.-n_it_nor);
                n_grow = n_grow*n_grow
                let a_o_p_circles = f_a_o_p_circles(
                    n_corners, 
                    n_radius*n_grow+20, 
                    n_sin_amp, 
                    n_freq, 
                    n_it_nor
                );
                let o_mesh = f_o_extruded_mesh_curvepoints(a_o_p_circles, n_layer_height_mm, n_corners);
                o_mesh.position.set(0,0,n_it*n_layer_height_mm);
                return o_mesh
            })

            return a_o_mesh

        }
    ),
    f_o_function(
        'zig_zag',
        function() {
            // let ov = f_ov({
            //     n_its: {n_min: 3, n_max: 10, n: 10},
            //     n_amp: 20,
            // });
            let n_tau = Math.PI * 2;
            let n_layer_height_mm = 0.2 / 2.;///2. for more precision, subsampling
            let n_radius_bottom = 28.;
            let n_radius_top = 30.;
            let n_height = 60.;
            let n_corners = 5.;
            let n_its = n_height / n_layer_height_mm;
            let a_o = [
                ...new Array(n_its).fill(0).map(
                    (n, n_idx) => {
                        let n_it = parseInt(n_idx)
                        let n_it_nor = n_it / n_its;
                        let n_rotation_radians = n_it_nor * n_tau / 5;
                        let n_radius_plus_minus = 3;
        
                        let n_reps = n_it_nor*10;
                        let n_reps_fract = n_reps % 1;
                        let a = n_reps %1;
                        let b = (1.-a);
                        let c = Math.min(a,b);
                        let n_radius = n_radius_bottom + (c)*10;
                        return f_o_reg_poly(
                            f_o_vec(0, 0, n_it * n_layer_height_mm),
                            n_rotation_radians,
                            n_radius,
                            n_corners,
                            n_layer_height_mm
                        )
                    }
                )
            ]
            return a_o
            // Merge geometries
            // const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
            //     a_o.map(o=>{
            //         o.updateMatrixWorld();
            //         return o.geometry.clone().applyMatrix4(o.matrixWorld);
            //     })
            //     , 
            //     false
            // );
            
            // const mergedMesh = f_o_shaded_mesh(mergedGeometry);
            // return [mergedMesh]
        
        }
    ), 
    f_o_function(
        'vase_hexagonal_twisted_accordion',
        function() {
            // let ov = f_ov({
            //     n_its: {n_min: 3, n_max: 10, n: 10},
            //     n_amp: 20,
            // });
            let n_tau = Math.PI * 2;
            let n_layer_height_mm = 0.2;///2. for more precision, subsampling
            let n_radius_bottom = 28.;
            let n_radius_top = 45.;
            let n_height = 120.;
            let n_corners = 6.;
            let n_its = n_height / n_layer_height_mm;
            let a_o = [
                ...new Array(n_its).fill(0).map(
                    (n, n_idx) => {
                        let n_it = parseInt(n_idx)
                        let n_it_nor = n_it / n_its;
                        let n_rotation_radians = n_it_nor * n_tau / 5;
                        let n_radius_plus_minus = 3;
        
                        let n_reps = n_it_nor*10;
                        let n_reps_fract = n_reps % 1;
                        let a = n_reps %1;
                        let b = (1.-a);
                        let c = Math.min(a,b);
                        let n_radius = (n_radius_bottom
                        + (n_radius_top-n_radius_bottom)*n_it_nor*n_it_nor) + (c)*10;
                        return f_o_reg_poly(
                            f_o_vec(0, 0, n_it * n_layer_height_mm),
                            n_rotation_radians,
                            n_radius,
                            n_corners,
                            n_layer_height_mm
                        )
                    }
                )
            ]
            return a_o
        
        }
    ),
    f_o_function(
        'ugly_coded',
        function() {
            // let ov = f_ov({
            //     n_its: {n_min: 3, n_max: 10, n: 10},
            //     n_amp: 20,
            // });
            let f_o_reg_poly2 = function (
                o_trn,
                n_rot_radians,
                n_radius,
                n_corners,
                n_extrusion
            ) {
                let a_o = f_a_o_p_reg_poly2(
                    o_trn,
                    n_corners,
                    n_radius,
                    0.,//n_rot_radians
                )
                // Convert your points to Three.js Vector2 array
                const a_o_point = a_o.map(o => new THREE.Vector3(o.n_x, o.n_y, o.n_z));
                // Create a shape from the points
                const o_shape = new THREE.Shape(a_o_point);
        
                // Extrusion settings (0.2mm in z-direction)
                const extrudeSettings = {
                    depth: n_extrusion, // 0.2mm extrusion
                    bevelEnabled: false // No bevel for simple extrusion
                };
        
                // Create the extruded geometry
                const geometry = new THREE.ExtrudeGeometry(o_shape, extrudeSettings);
        
                // Create a mesh with the geometry and a material
                const mesh = new f_o_shaded_mesh(geometry);
        
                // Apply translation if o_trn is provided
                if (o_trn) {
                    mesh.position.set(
                        o_trn.n_x || 0,
                        o_trn.n_y || 0,
                        o_trn.n_z || 0
                    );
                }
        
                // Apply rotation if n_rot_radians is provided
                if (n_rot_radians !== undefined) {
                    mesh.rotation.z = n_rot_radians; // Rotate around Z-axis
                }
        
                return mesh
            }
            let f_a_o_p_reg_poly2 = function (
                o_trn,
                n_corners,
                n_amp,
                n_radians_rotation
            ) {
                let n_a = n_amp
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseInt(n_idx);
                    let n_it_nor = n_it / n_corners;
                    if (n_it % 2 == 0) {
                        n_a = n_amp+20
                    }else{
                        n_a = n_amp
                    }
                    let o_trn2 = f_o_vec(
                        Math.sin(n_tau * n_it_nor + n_radians_rotation) * n_a,
                        Math.cos(n_tau * n_it_nor + n_radians_rotation) * n_a,
                        0,
                    )
                    return f_o_vec(
                        o_trn.n_x + o_trn2.n_x,
                        o_trn.n_y + o_trn2.n_y,
                        o_trn.n_z + o_trn2.n_z,
                    );
                });
                return a_o
            }
            let n_tau = Math.PI * 2;
            let n_layer_height_mm = 0.2;///2. for more precision, subsampling
            let n_radius_bottom = 40.;
            let n_radius_top = 70.;
            let n_height = 200;
            let n_corners = 30.;
            let n_its = n_height / n_layer_height_mm;
            let a_o = [
                ...new Array(n_its).fill(0).map(
                    (n, n_idx) => {
                        let n_it = parseInt(n_idx)
                        let n_it_nor = n_it / n_its;
                        let n_rotation_radians = n_it_nor * n_tau / 5;
                        let n_radius_plus_minus = 3;
        
                        let n_reps = n_it_nor * 10;
                        let n_reps_fract = n_reps % 1;
                        let a = n_reps % 1;
                        let b = (1. - a);
                        let c = Math.min(a, b);
                        let n_radius = (n_radius_bottom
                            + (n_radius_top - n_radius_bottom) * n_it_nor * n_it_nor) + Math.sin(n_it_nor * n_tau * 10) * 2
                        return f_o_reg_poly2(
                            f_o_vec(0, 0, n_it * n_layer_height_mm),
                            n_rotation_radians,
                            n_radius,
                            n_corners,
                            n_layer_height_mm
                        )
                    }
                )
            ]
            return a_o
        
        }
    ), 
    f_o_function(
        'vase_preset',
        function(){
            let f_o_extruded_mesh = function(a_o_p, n_extrusion){
                const a_o_point = a_o_p.map(o => new THREE.Vector3(o.n_x, o.n_y, o.n_z));
                const o_shape = new THREE.Shape(a_o_point);
                const extrudeSettings = {
                    depth: n_extrusion, // 0.2mm extrusion
                    bevelEnabled: false // No bevel for simple extrusion
                };
                const geometry = new THREE.ExtrudeGeometry(o_shape, extrudeSettings);
                const mesh = f_o_shaded_mesh(geometry);
                return mesh
            }
            let f_a_o_p = function(
                n_corners, 
                n_amp,
                n_rad_offset
            ){
                let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                    let n_it = parseFloat(n_idx);
                    let n_it_nor = n_it/n_corners;
                    // modify the polygon here 
                    let o_trn = f_o_vec(
                        Math.sin(n_tau*n_it_nor+n_rad_offset)*n_amp,
                        Math.cos(n_tau*n_it_nor+n_rad_offset)*n_amp,
                        0,
                    )
                    return o_trn
                });
                return a_o
            }
            let n_tau = Math.PI*2;
            let n_layer_height_mm = 0.2;///2; for more precision, subsampling, but slower!
            let n_height = 60.;
            let n_corners = 120.;
            let n_radius = 30.;
            let n_its = n_height / n_layer_height_mm;
            let a_o = [
                ...new Array(n_its).fill(0).map(
                    (n, n_idx)=>{
                        let n_it = parseFloat(n_idx)
                        let n_it_nor = n_it/n_its;
                        let a_o_p = f_a_o_p(
                            n_corners, 
                            n_radius,
                            0// twist
                        );
                        let o_mesh = f_o_extruded_mesh(
                            a_o_p, 
                            n_layer_height_mm
                        )
                        let n_rotation = 0;
                        o_mesh.rotation.set(0,0,n_rotation)
                        let n_z = n_it*n_layer_height_mm
                        o_mesh.position.set(0,0,n_z);
                        return o_mesh
                    }
                )
            ]
            return a_o
        }
    ),      
    f_o_function(
        'vase_3parts',
        function(){
            let f_o_extruded_mesh = function(a_o_p, n_extrusion){
                const a_o_point = a_o_p.map(o => new THREE.Vector3(o.n_x, o.n_y, o.n_z));
                const o_shape = new THREE.Shape(a_o_point);
                const extrudeSettings = {
                    depth: n_extrusion, // 0.2mm extrusion
                    bevelEnabled: false // No bevel for simple extrusion
                };
                const geometry = new THREE.ExtrudeGeometry(o_shape, extrudeSettings);
                const mesh = f_o_shaded_mesh(geometry);
                return mesh
            }
            let f_a_o_p = function(
                n_corners, 
                n_amp,
                n_rad_offset, 
                n_it_nor
            ){
                let na = n_amp;
                let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                    let n_it = parseFloat(n_idx);
                    let n_it_nor = n_it/n_corners;
                    // modify the polygon here 
                    let n_waves = 50.;
                    let n2 = (Math.cos(n_it_nor*n_tau*n_waves)*.5-.5)*5.;
                    n2 *= Math.min(0,Math.sin(n_it_nor*n_tau*3));
                    na = n_amp;
                    na -= n2;
                    let o_trn = f_o_vec(
                        Math.sin(n_tau*n_it_nor+n_rad_offset)*na,
                        Math.cos(n_tau*n_it_nor+n_rad_offset)*na,
                        0,
                    )
                    return o_trn
                });
                return a_o
            }
            let n_tau = Math.PI*2;
            let n_layer_height_mm = 0.2;///2; for more precision, subsampling, but slower!
            let n_height = 100.;
            let n_corners = 200.;
            let n_radius = 20.;
            let n_its = n_height / n_layer_height_mm;
            let a_o = [
                ...new Array(n_its).fill(0).map(
                    (n, n_idx)=>{
                        let n_it = parseFloat(n_idx)
                        let n_it_nor = n_it/n_its;
                        let n_r = (Math.sin(n_it_nor*n_tau*0.9)*.5+.5)*(n_radius*1.2)+n_radius
                        let a_o_p = f_a_o_p(
                            n_corners, 
                            n_r,
                            n_it_nor*n_tau/3.,// twist, 
                            n_it_nor
                        );
                        let o_mesh = f_o_extruded_mesh(
                            a_o_p, 
                            n_layer_height_mm
                        )
                        let n_rotation = 0;
                        o_mesh.rotation.set(0,0,n_rotation)
                        let n_z = n_it*n_layer_height_mm
                        o_mesh.position.set(0,0,n_z);
                        return o_mesh
                    }
                )
            ]
            return a_o
        }
    ), 
    f_o_function(
        'polygon_subsampling',
        function(){
            let f_o_extruded_mesh = function(a_o_p, n_extrusion){
                const a_o_point = a_o_p.map(o => new THREE.Vector3(o.n_x, o.n_y, o.n_z));
                const o_shape = new THREE.Shape(a_o_point);
                const extrudeSettings = {
                    depth: n_extrusion, // 0.2mm extrusion
                    bevelEnabled: false // No bevel for simple extrusion
                };
                const geometry = new THREE.ExtrudeGeometry(o_shape, extrudeSettings);
                const mesh = f_o_shaded_mesh(geometry);
                return mesh
            }
            let f_a_o_p = function(
                n_corners, 
                n_amp,
                n_rad_offset, 
                n_it_nor2
            ){
                let n_its_subsample = 100;
                let na = n_amp;
                let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                    let n_it = parseFloat(n_idx);
                    let n_it_nor = n_it/n_corners;
                    let a_o_between = []
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor*n_tau+n_rad_offset)*n_amp,
                        Math.cos(n_it_nor*n_tau+n_rad_offset)*n_amp,
                    ); 
                    let o_trn2 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(((n_it+1)/n_corners)*n_tau+n_rad_offset)*n_amp,
                        Math.cos(((n_it+1)/n_corners)*n_tau+n_rad_offset)*n_amp,
                    ); 
                    for(let n_it_subsample = 0; n_it_subsample< n_its_subsample; n_it_subsample+=1){
                        let n_it_nor_subsample = n_it_subsample/n_its_subsample;
                        let n_it_nor_circle = n_it_nor + (n_it_nor_subsample/n_corners)
                        let n_t = n_it_nor_subsample;
                        let o_trn_between = f_o_vec(
                            o_trn1.n_x + (o_trn2.n_x - o_trn1.n_x) * n_t,
                            o_trn1.n_y + (o_trn2.n_y - o_trn1.n_y) * n_t,
                            0
                        );
                        let n_radius = Math.sqrt(Math.pow(o_trn_between.n_x,2)+Math.pow(o_trn_between.n_y,2));// radius from point between. 
                        // let n_radians_between = 0;// angle between. 
                        n_radius = n_radius + Math.sin(n_it_nor_subsample*n_tau*10)*2;
                        let o_trn_between2 = f_o_vec( //this would be the point that is on the corner of the polygon
                            Math.sin(n_it_nor_circle*n_tau+n_rad_offset)*n_radius,
                            Math.cos(n_it_nor_circle*n_tau+n_rad_offset)*n_radius,
                        ); 
                        a_o_between.push(o_trn_between2)
                    }
                    
                    return a_o_between


                }).flat();
                return a_o

            }
            let n_tau = Math.PI*2;
            let n_layer_height_mm = 0.2;//0.2;///2; for more precision, subsampling, but slower!
            let n_height = 100.;
            let n_corners = 5.;
            let n_radius = 20.;
            let n_its = n_height / n_layer_height_mm;
            let a_o = [
                ...new Array(n_its).fill(0).map(
                    (n, n_idx)=>{
                        let n_it = parseFloat(n_idx)
                        let n_it_nor = n_it/n_its;
                        let n_r = (Math.sin(n_it_nor*n_tau*0.9)*.5+.5)*(n_radius*1.2)+n_radius
                        let a_o_p = f_a_o_p(
                            n_corners, 
                            n_r,
                            n_it_nor*n_tau/3.,// twist, 
                            n_it_nor
                        );
                        let o_mesh = f_o_extruded_mesh(
                            a_o_p, 
                            n_layer_height_mm
                        )
                        let n_rotation = 0;
                        o_mesh.rotation.set(0,0,n_rotation)
                        let n_z = n_it*n_layer_height_mm
                        o_mesh.position.set(0,0,n_z);
                        return o_mesh
                    }
                )
            ]
            return a_o
        }
    ), 
    f_o_function(
        'outline_test',
        function(){

            function f_o_outline_mesh(a_o_p, n_thickness = 0.1, n_color = 0x000000) {
            const a_o_point = a_o_p.map(o => new THREE.Vector3(o.n_x, o.n_y, o.n_z));
            
            // Close the loop (add first point at the end if not already closed)
            if (!a_o_point[0].equals(a_o_point[a_o_point.length - 1])) {
                a_o_point.push(a_o_point[0].clone());
            }
            
            // Convert to LineGeometry format (flat array of positions)
            const a_n_positions = [];
            a_o_point.forEach(o_p => {
                a_n_positions.push(o_p.x, o_p.y, o_p.z);
            });
            
            const o_geometry = new LineGeometry();
            o_geometry.setPositions(a_n_positions);
            
            const o_material = new LineMaterial({
                color: n_color,
                linewidth: 1, // in world units (requires proper rendering setup)
                worldUnits: true, // makes linewidth in real units instead of pixels
            });
            
            const o_line = new Line2(o_geometry, o_material);
            // let o_line = f_o_shaded_mesh(o_geometry)
            return o_line;
        }
        
                    let f_o_extruded_mesh = function(a_o_p, n_extrusion){
                        const a_o_point = a_o_p.map(o => new THREE.Vector3(o.n_x, o.n_y, o.n_z));
                        const o_shape = new THREE.Shape(a_o_point);
                        const extrudeSettings = {
                            depth: n_extrusion, // 0.2mm extrusion
                            bevelEnabled: false // No bevel for simple extrusion
                        };
                        const geometry = new THREE.ExtrudeGeometry(o_shape, extrudeSettings);
                        const mesh = f_o_shaded_mesh(geometry);
                        return mesh
                    }
                    let f_a_o_p = function(
                        n_corners, 
                        n_amp,
                        n_rad_offset, 
                        n_it_nor
                    ){
                        let na = n_amp;
                        let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                            let n_it = parseFloat(n_idx);
                            let n_it_nor = n_it/n_corners;
                            // modify the polygon here 
                            let n_waves = 50.;
                            let n2 = (Math.cos(n_it_nor*n_tau*n_waves)*.5-.5)*5.;
                            n2 *= Math.min(0,Math.sin(n_it_nor*n_tau*3));
                            na = n_amp;
                            na -= n2;
                            let o_trn = f_o_vec(
                                Math.sin(n_tau*n_it_nor+n_rad_offset)*na,
                                Math.cos(n_tau*n_it_nor+n_rad_offset)*na,
                                0,
                            )
                            return o_trn
                        });
                        return a_o
                    }
                    let n_tau = Math.PI*2;
                    let n_layer_height_mm = 0.2;///2; for more precision, subsampling, but slower!
                    let n_height = 10.;
                    let n_corners = 200.;
                    let n_radius = 2.;
                    let n_its = n_height / n_layer_height_mm;
                    let a_o = [
                        ...new Array(n_its).fill(0).map(
                            (n, n_idx)=>{
                                let n_it = parseFloat(n_idx)
                                let n_it_nor = n_it/n_its;
                                let n_r = (Math.sin(n_it_nor*n_tau*0.9)*.5+.5)*(n_radius*1.2)+n_radius
                                let a_o_p = f_a_o_p(
                                    n_corners, 
                                    n_r,
                                    n_it_nor*n_tau/3.,// twist, 
                                    n_it_nor
                                );
                                let o_mesh = f_o_outline_mesh(
                                    a_o_p, 
                                    n_layer_height_mm
                                )
                                let n_rotation = 0;
                                o_mesh.rotation.set(0,0,n_rotation)
                                let n_z = n_it*n_layer_height_mm
                                o_mesh.position.set(0,0,n_z);
                                return o_mesh
                            }
                        )
                    ]
                    return a_o
                }
    ), 
    f_o_function(
        'custom_shape', 
        function(){

            let f_o_geometry_from_a_o_p_polygon_vertex = function(a_o_p, n_its_corner){

                let a_o_i = [];//indices
                let a_o_v = [...a_o_p.map(o=>{return [o.n_x, o.n_y, o.n_z]}).flat()];//vertices
                let n_its_layer = a_o_p.length / n_its_corner;
                for(let n_it_layer = 0; n_it_layer < (n_its_layer-1); n_it_layer+=1){
                    let n_idx_start_corner_on_layer = n_it_layer*n_its_corner;
                    for(let n_it_corner = 0; n_it_corner < n_its_corner; n_it_corner+=1){

                        let n_idx_p = n_it_corner;
                        let n_idx_p_top = n_it_corner+n_its_corner;
                        let n_idx_p_next = (n_it_corner+1)%n_its_corner;
                        let n_idx_p_top_next = n_idx_p_next+n_its_corner;

                        n_idx_p+=n_idx_start_corner_on_layer
                        n_idx_p_top+=n_idx_start_corner_on_layer
                        n_idx_p_next+=n_idx_start_corner_on_layer
                        n_idx_p_top_next+=n_idx_start_corner_on_layer

                        a_o_i.push(n_idx_p, n_idx_p_next, n_idx_p_top);
                        a_o_i.push(n_idx_p_top, n_idx_p_next, n_idx_p_top_next);
                    }
                }

                const geometry = new THREE.BufferGeometry();
                geometry.setIndex(a_o_i);
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(a_o_v, 3));
                
                // Compute normals for proper lighting
                geometry.computeVertexNormals();
                return geometry

            }


            let f_o_geometry_from_a_o_p_polygon_face = function(a_o_p){

                // assuming the first array item is the center point of the polygon 

                
                let a_o_i = [];//indices
                let a_o_v = [...a_o_p.map(o=>{return [o.n_x, o.n_y, o.n_z]}).flat()];//vertices
                let n_idx_vertex_center = 0;
                let n_corners = a_o_p.length-1;
                for(let n_i = 0; n_i < n_corners; n_i+=1){
                    let n_idx_p1 = n_idx_vertex_center; 
                    let n_idx_p2 = (n_i)%n_corners
                    let n_idx_p3 = (n_i+1)%n_corners
                    console.log('loop')
                    n_idx_p2+=1;//+1 because of added cneter point
                    n_idx_p3+=1;//+1 because of added cneter point
                    a_o_i.push(n_idx_p1,n_idx_p2,n_idx_p3)
                }

                const geometry = new THREE.BufferGeometry();
                geometry.setIndex(a_o_i);
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(a_o_v, 3));
                
                // Compute normals for proper lighting
                geometry.computeVertexNormals();
                return geometry


            }

            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }

            function f_a_o_p(o_trn, n_corners, n_radius, n_rad_offset) {
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor = n_it / n_corners;
                    let o_trn2 = f_o_vec(
                        Math.sin(n_tau * n_it_nor + n_rad_offset) * n_radius,
                        Math.cos(n_tau * n_it_nor + n_rad_offset) * n_radius,
                        0,
                    );
                    return f_o_vec(
                        o_trn2.n_x + o_trn.n_x,
                        o_trn2.n_y + o_trn.n_y,
                        o_trn2.n_z + o_trn.n_z,
                    );
                });
                return a_o;
            }

            const n_tau = Math.PI * 2;
            let n_its_layer = 2.;
            let n_layer_height = 10.;
            let a_o_geometry = []
            let a_o_p_outside = []
            let n_corners = 3.;

            for(let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer+=1){
                let n_it_layer_nor = n_it_layer/n_its_layer;
                let n_z = n_it_layer_nor*n_layer_height;
                let n_radius = 10.;
                let n_rad_offset = 0.;
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z),n_corners, n_radius, n_rad_offset);
                a_o_p_outside.push(...a_o_p);
                if(n_it_layer == 0 || n_it_layer == n_its_layer-1){
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0,0,n_z),...a_o_p])
                    )
                }
            }

            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o=>{return f_o_shaded_mesh(o)})
            
            return a_o_mesh
        }
    ), 
    f_o_function(
        'o_test', 
        function(){
            // 1. Create the geometry
            const geometry = new THREE.BufferGeometry();

            // 2. Define vertices (for a pentagon in this case)
            const vertices = new Float32Array([
            // Center point (optional)
            0, 0, 0,
            
            // Outer points (pentagon vertices)
            1, 0, 0,          // right
            0.31, 0.95, 0,    // top-right
            -0.81, 0.59, 0,   // top-left
            -0.81, -0.59, 0,  // bottom-left
            0.31, -0.95, 0    // bottom-right
            ]);

            // 3. Define indices (how vertices connect to form triangles)
            const indices = new Uint16Array([
            // Triangles fanning out from center
            0, 1, 2,  // center → right → top-right
            0, 2, 3,  // center → top-right → top-left
            0, 3, 4,  // center → top-left → bottom-left
            0, 4, 5,  // center → bottom-left → bottom-right
            0, 5, 1   // center → bottom-right → right
            ]);

            // 4. Apply to geometry
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geometry.setIndex(new THREE.BufferAttribute(indices, 1));

            // 5. Create material and mesh
            const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide, // Show both sides
            wireframe: false
            });

            return [f_o_shaded_mesh(geometry)]
        }
    ),
    f_o_function(
        'custom_shape_easy', 
        function(){
            
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }

            function f_a_o_p(o_trn, n_corners, n_radius, n_rad_offset, n_it_layer_nor) {
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor = n_it / n_corners;
                    let n_intensity = Math.sin(n_tau*n_it_nor*6.)*.5+.5;
                    n_radius += Math.sin(n_tau*n_it_nor*30.)*.2*n_intensity;
                    let o_trn2 = f_o_vec(
                        Math.sin(n_tau * n_it_nor + n_rad_offset) * n_radius,
                        Math.cos(n_tau * n_it_nor + n_rad_offset) * n_radius,
                        0,
                    );
                    return f_o_vec(
                        o_trn2.n_x + o_trn.n_x,
                        o_trn2.n_y + o_trn.n_y,
                        o_trn2.n_z + o_trn.n_z,
                    );
                });
                return a_o;
            }

            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 180.;
            let n_layer_height = 0.2;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 500.;
            let a_o_p_outside = [];
            let n_radius_base = 50.;

            for(let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer+=1){
                let n_it_layer_nor = n_it_layer/n_its_layer;
                let n_z = n_it_layer*n_layer_height;
                let n_radius = n_radius_base+Math.sin(n_it_layer_nor*n_tau*0.96+0.2)*18;
                let n_rad_offset = n_it_layer_nor; // a slight twist
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z),n_corners, n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
                if(n_it_layer == 0 || n_it_layer == n_its_layer-1){
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0,0,n_z),...a_o_p])
                    )
                }
            }

            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o=>{return f_o_shaded_mesh(o)})
            
            return a_o_mesh
        }
    ), 
    f_o_function(
        'egg_shaped_vase', 
        function(){
            
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }

            function f_a_o_p(o_trn, n_corners, n_radius, n_rad_offset, n_it_layer_nor) {
                let a_o = new Array(n_corners).fill(0).map((v, n_idx) => {
                    let n_it = parseFloat(n_idx);
                    let n_it_nor = n_it / n_corners;
                    let n_intensity = Math.sin(n_tau*n_it_nor*6.)*1;
                    n_radius += Math.sin(n_tau*n_it_nor*30.)*.2*n_intensity;
                    let o_trn2 = f_o_vec(
                        Math.sin(n_tau * n_it_nor + n_rad_offset) * n_radius,
                        Math.cos(n_tau * n_it_nor + n_rad_offset) * n_radius,
                        0,
                    );
                    return f_o_vec(
                        o_trn2.n_x + o_trn.n_x,
                        o_trn2.n_y + o_trn.n_y,
                        o_trn2.n_z + o_trn.n_z,
                    );
                });
                return a_o;
            }

            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 100.;
            let n_layer_height = 0.2;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 500.;
            let a_o_p_outside = [];
            let n_radius_base = 70.;

            for(let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer+=1){
                let n_it_layer_nor = n_it_layer/n_its_layer;
                let n_z = n_it_layer*n_layer_height;
                let n_x = (n_it_layer_nor-.5)*2.*0.75-0.1//-0.05;
                let n_egg_shape = Math.sqrt(1.-(Math.pow(n_x,2)*0.4+0.6)); 
                let n_radius = n_radius_base*n_egg_shape;
                let n_rad_offset = n_it_layer_nor; // a slight twist
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z),n_corners, n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
                if(n_it_layer == 0 || n_it_layer == n_its_layer-1){
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0,0,n_z),...a_o_p])
                    )
                }
            }

            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners)
            )
            let a_o_mesh = a_o_geometry.map(o=>{return f_o_shaded_mesh(o)})
            
            return a_o_mesh
        }
    ),
    f_o_function(
        'polygon_with_waves', 
        function(){
            
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }

            function f_a_o_p(o_trn, n_corners, n_its_subsample, n_amp, n_rad_offset, n_it_layer_nor) {
                let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it/n_corners;
                    let a_o_between = []
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner*n_tau+n_rad_offset)*n_amp,
                        Math.cos(n_it_nor_corner*n_tau+n_rad_offset)*n_amp,
                        0
                    ); 
                    let o_trn2 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(((n_it+1)/n_corners)*n_tau+n_rad_offset)*n_amp,
                        Math.cos(((n_it+1)/n_corners)*n_tau+n_rad_offset)*n_amp,
                        0
                    ); 
                    for(let n_it_subsample = 0; n_it_subsample< n_its_subsample; n_it_subsample+=1){
                        let n_it_nor_subsample = n_it_subsample/n_its_subsample;
                        let n_it_nor_circle = n_it_nor_corner + (n_it_nor_subsample/n_corners)
                        let n_t = n_it_nor_subsample;
                        let o_trn_between = f_o_vec(
                            o_trn1.n_x + (o_trn2.n_x - o_trn1.n_x) * n_t,
                            o_trn1.n_y + (o_trn2.n_y - o_trn1.n_y) * n_t,
                            0
                        );
                        let n_radius = Math.sqrt(Math.pow(o_trn_between.n_x,2)+Math.pow(o_trn_between.n_y,2));// radius from point between. 
                        // let n_radians_between = 0;// angle between. 
                        let n_sin = Math.sin(n_it_nor_subsample*n_tau*33)*1;
                        let n_sin_corner = Math.sin(((n_it_nor_corner+n_it_nor_subsample/n_corners)+(1./n_corners/2))*n_tau*n_corners*.5);
                        n_sin_corner = Math.min(n_sin_corner, 0);
                        n_radius = n_radius + n_sin*n_sin_corner;
                        let o_trn_between2 = f_o_vec( //this would be the point that is on the corner of the polygon
                            Math.sin(n_it_nor_circle*n_tau+n_rad_offset)*n_radius,
                            Math.cos(n_it_nor_circle*n_tau+n_rad_offset)*n_radius,
                            0
                        );
                        o_trn_between2 = f_o_vec(
                            o_trn.n_x+o_trn_between2.n_x,
                            o_trn.n_y+o_trn_between2.n_y,
                            o_trn.n_z+o_trn_between2.n_z,
                        )
                        a_o_between.push(o_trn_between2)
                    }
                    
                    return a_o_between


                }).flat();
                return a_o
            }

            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 200.;
            let n_layer_height = 0.2;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 6.;
            let n_its_subsample = 100.;
            let a_o_p_outside = [];
            let n_radius_base = n_height/4;
            // const phi = (1 + Math.sqrt(5)) / 2;


            for(let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer+=1){
                let n_it_layer_nor = n_it_layer/n_its_layer;
                let n_z = n_it_layer*n_layer_height;
                let n_radius = n_radius_base+Math.sin(n_it_layer_nor*n_tau)*n_radius_base*.4;
                n_radius += Math.sin(n_it_layer_nor*n_tau*12)*0.2;
                let n_rad_offset = n_it_layer_nor*(n_tau/n_corners);
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z),n_corners,n_its_subsample,n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
                if(n_it_layer == 0 || n_it_layer == n_its_layer-1){
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0,0,n_z),...a_o_p])
                    )
                }
            }

            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners*n_its_subsample)
            )
            let a_o_mesh = a_o_geometry.map(o=>{return f_o_shaded_mesh(o)})
            
            return a_o_mesh
        }
    ),
    f_o_function(
        'polygon_subsample_correct_not_linear_subangle',
        function(){
            
            // Assuming you have your point generation functions as shown
            function f_o_vec(x, y, z) {
                return { n_x: x, n_y: y, n_z: z };
            }

            function f_a_o_p(o_trn, n_corners, n_its_subsample, n_amp, n_rad_offset, n_it_layer_nor) {

                let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                    let n_it = parseFloat(n_idx);
                    let n_it_nor_corner = n_it/n_corners;
                    let a_o_between = []
                    let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(n_it_nor_corner*n_tau+n_rad_offset)*n_amp,
                        Math.cos(n_it_nor_corner*n_tau+n_rad_offset)*n_amp,
                        0
                    ); 
                    let o_trn2 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(((n_it+1)/n_corners)*n_tau+n_rad_offset)*n_amp,
                        Math.cos(((n_it+1)/n_corners)*n_tau+n_rad_offset)*n_amp,
                        0
                    ); 

                    const theta_k = (n_it / n_corners) * n_tau + n_rad_offset;
                    const theta_k_plus_1 = ((n_it + 1) / n_corners) * n_tau + n_rad_offset;

                    for(let n_it_subsample = 0; n_it_subsample< n_its_subsample; n_it_subsample+=1){
                        let n_it_nor_subsample = n_it_subsample/n_its_subsample;
                        let n_it_nor_circle = n_it_nor_corner + (n_it_nor_subsample/n_corners)
                        let n_t = n_it_nor_subsample;
                        let o_trn_between = f_o_vec(
                            o_trn1.n_x + (o_trn2.n_x - o_trn1.n_x) * n_t,
                            o_trn1.n_y + (o_trn2.n_y - o_trn1.n_y) * n_t,
                            0
                        );
                        let n_radius = Math.sqrt(Math.pow(o_trn_between.n_x,2)+Math.pow(o_trn_between.n_y,2));// radius from point between. 
                        // let n_radians_between = 0;// angle between. 
                        let n_sin = Math.sin(n_it_nor_subsample*n_tau*6)*4;
                        let n_sin_corner = Math.sin(((n_it_nor_corner+n_it_nor_subsample/n_corners)+(1./n_corners/4))*n_tau*n_corners);
                        n_sin_corner = Math.min(n_sin_corner, 0);
                        n_radius = n_radius + n_sin*n_sin_corner;
                        let n_sin_add = Math.sin(n_it_nor_subsample*n_tau*.5)*18;
                        // n_sin_add = Math.max(0,n_sin_add);
                        n_radius += n_sin_add;
                                    // Correct angle interpolation (handles circular wrapping)
                        const sin_avg = (1 - n_t) * Math.sin(theta_k) + n_t * Math.sin(theta_k_plus_1);
                        const cos_avg = (1 - n_t) * Math.cos(theta_k) + n_t * Math.cos(theta_k_plus_1);
                        const theta_interp = Math.atan2(sin_avg, cos_avg);

                        let o_trn_between2 = f_o_vec( //this would be the point that is on the corner of the polygon
                            Math.sin(theta_interp+n_rad_offset)*n_radius,
                            Math.cos(theta_interp+n_rad_offset)*n_radius,
                            0
                        );
                        o_trn_between2 = f_o_vec(
                            o_trn.n_x+o_trn_between2.n_x,
                            o_trn.n_y+o_trn_between2.n_y,
                            o_trn.n_z+o_trn_between2.n_z,
                        )
  
                        a_o_between.push(o_trn_between2)
                    }
                    
                    return a_o_between


                }).flat();
                return a_o
            }

            const n_tau = Math.PI * 2;
            // all units in millimeter mm
            let n_height = 200.;
            let n_layer_height = 0.6;
            let n_its_layer = parseInt(n_height / n_layer_height);
            let a_o_geometry = []
            let n_corners = 3.;
            let n_its_subsample = 200.;
            let a_o_p_outside = [];
            let n_radius_base = n_height/3;
            // const phi = (1 + Math.sqrt(5)) / 2;


            for(let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer+=1){
                let n_it_layer_nor = n_it_layer/n_its_layer;
                let n_z = n_it_layer*n_layer_height;
                let n_radius = n_radius_base+Math.sin(n_it_layer_nor*n_tau)*n_radius_base*.4;
                n_radius += Math.sin(n_it_layer_nor*n_tau*6)*0.2;
                
                let n_rad_offset = n_it_layer_nor*(n_tau/n_corners/2);
                let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z),n_corners,n_its_subsample,n_radius, n_rad_offset, n_it_layer_nor);
                a_o_p_outside.push(...a_o_p);
                if(n_it_layer == 0 || n_it_layer == n_its_layer-1){
                    // only bottom and top face
                    a_o_geometry.push(
                        f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0,0,n_z),...a_o_p])
                    )
                }
            }

            a_o_geometry.push(
                // the outside / 'skirt' of the extruded polygon
                f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners*n_its_subsample)
            )
            let a_o_mesh = a_o_geometry.map(o=>{return f_o_shaded_mesh(o)})
            
            return a_o_mesh
        }
    ),
    f_o_function('vase_three_parts_polygon',
    function(){
            
        // Assuming you have your point generation functions as shown
        function f_o_vec(x, y, z) {
            return { n_x: x, n_y: y, n_z: z };
        }

        function f_a_o_p(o_trn, n_corners, n_its_subsample, n_amp, n_rad_offset, n_it_layer_nor) {

            let a_o = new Array(n_corners).fill(0).map((v, n_idx)=>{
                let n_it = parseFloat(n_idx);
                let n_it_nor_corner = n_it/n_corners;
                let a_o_between = []
                let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                    Math.sin(n_it_nor_corner*n_tau+n_rad_offset)*n_amp,
                    Math.cos(n_it_nor_corner*n_tau+n_rad_offset)*n_amp,
                    0
                ); 
                let o_trn2 = f_o_vec( //this would be the point that is on the corner of the polygon
                    Math.sin(((n_it+1)/n_corners)*n_tau+n_rad_offset)*n_amp,
                    Math.cos(((n_it+1)/n_corners)*n_tau+n_rad_offset)*n_amp,
                    0
                ); 

                const theta_k = (n_it / n_corners) * n_tau + n_rad_offset;
                const theta_k_plus_1 = ((n_it + 1) / n_corners) * n_tau + n_rad_offset;

                for(let n_it_subsample = 0; n_it_subsample< n_its_subsample; n_it_subsample+=1){
                    let n_it_nor_subsample = n_it_subsample/n_its_subsample;
                    let n_it_nor_circle = n_it_nor_corner + (n_it_nor_subsample/n_corners)
                    let n_t = n_it_nor_subsample;
                    let o_trn_between = f_o_vec(
                        o_trn1.n_x + (o_trn2.n_x - o_trn1.n_x) * n_t,
                        o_trn1.n_y + (o_trn2.n_y - o_trn1.n_y) * n_t,
                        0
                    );
                    let n_radius = Math.sqrt(Math.pow(o_trn_between.n_x,2)+Math.pow(o_trn_between.n_y,2));// radius from point between. 
                    // let n_radians_between = 0;// angle between. 
                    let n_sin = Math.sin(n_it_nor_subsample*n_tau*12)*2;
                    let n_sin_corner = Math.sin(((n_it_nor_corner+0.5+n_it_nor_subsample/n_corners)+(1./n_corners/4))*n_tau*n_corners);
                    n_sin_corner = Math.min(n_sin_corner, 0);
                    n_radius = n_radius + n_sin*n_sin_corner;
                    let n_sin_add = Math.sin(n_it_nor_subsample*n_tau*.5)*14;
                    // n_sin_add = Math.max(0,n_sin_add);
                    n_radius += n_sin_add;
                                // Correct angle interpolation (handles circular wrapping)
                    const sin_avg = (1 - n_t) * Math.sin(theta_k) + n_t * Math.sin(theta_k_plus_1);
                    const cos_avg = (1 - n_t) * Math.cos(theta_k) + n_t * Math.cos(theta_k_plus_1);
                    const theta_interp = Math.atan2(sin_avg, cos_avg);

                    let o_trn_between2 = f_o_vec( //this would be the point that is on the corner of the polygon
                        Math.sin(theta_interp+n_rad_offset)*n_radius,
                        Math.cos(theta_interp+n_rad_offset)*n_radius,
                        0
                    );
                    o_trn_between2 = f_o_vec(
                        o_trn.n_x+o_trn_between2.n_x,
                        o_trn.n_y+o_trn_between2.n_y,
                        o_trn.n_z+o_trn_between2.n_z,
                    )

                    a_o_between.push(o_trn_between2)
                }
                
                return a_o_between


            }).flat();
            return a_o
        }

        const n_tau = Math.PI * 2;
        // all units in millimeter mm
        let n_height = 200.;
        let n_layer_height = 0.6;
        let n_its_layer = parseInt(n_height / n_layer_height);
        let a_o_geometry = []
        let n_corners = 3.;
        let n_its_subsample = 200.;
        let a_o_p_outside = [];
        let n_radius_base = n_height/3;
        // const phi = (1 + Math.sqrt(5)) / 2;


        for(let n_it_layer = 0.; n_it_layer < n_its_layer; n_it_layer+=1){
            let n_it_layer_nor = n_it_layer/n_its_layer;
            let n_z = n_it_layer*n_layer_height;
            let n_radius = n_radius_base+Math.sin(n_it_layer_nor*n_tau)*n_radius_base*0.6;
            n_radius += Math.sin(n_it_layer_nor*n_tau*6)*0.2;
            
            let n_rad_offset = n_it_layer_nor*(n_tau/n_corners/2);
            let a_o_p = f_a_o_p(f_o_vec(0, 0, n_z),n_corners,n_its_subsample,n_radius, n_rad_offset, n_it_layer_nor);
            a_o_p_outside.push(...a_o_p);
            if(n_it_layer == 0 || n_it_layer == n_its_layer-1){
                // only bottom and top face
                a_o_geometry.push(
                    f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0,0,n_z),...a_o_p])
                )
            }
        }

        a_o_geometry.push(
            // the outside / 'skirt' of the extruded polygon
            f_o_geometry_from_a_o_p_polygon_vertex(a_o_p_outside, n_corners*n_its_subsample)
        )
        let a_o_mesh = a_o_geometry.map(o=>{return f_o_shaded_mesh(o)})
        
        return a_o_mesh
    }
    )
]
let o_div = document;
let o_blob_stl = null;
let a_o_license = await(await fetch('https://api.sketchfab.com/v3/licenses')).json()
let a_o_category = await(await(fetch('https://api.sketchfab.com/v3/categories'))).json()
let o_state = f_o_proxified_and_add_listeners(
    {
        
        b_show_sketchfab_upload_inputs: false,
        n_id_timeout_renderrefresh: 0, 
        n_ms_timeout_renderrefresh: 333,
        n_ts_ov_changed: false, 
        ov: {},
        b_add_circle_caps: true,
        s_name: "Vase - Really simple",
        s_description: 'A 3D-printable vase with mathematical influences.',// ugly work around
        a_s_tag: ['vase', 'vasemode', '3dprint'],
        s_tag: '',
        s_api_token_sketchfab: '',
        s_api_token_deepseek: '',
        o_function: null,
        a_o_function: a_o_function, 
        ...o_state_a_o_toast,
    }, 
    f_callback_beforevaluechange,
    f_callback_aftervaluechange, 
    o_div
)

globalThis.o_state = o_state
o_state.o_function = o_state.a_o_function[0]

let f_sleep_ms = async function(n_ms){
    return new Promise((f_res, f_rej)=>{
        setTimeout(()=>{
            return f_res(true)
        },n_ms)
    })
}

let f_add_tag = function(){
    if(o_state.s_tag != '' && !o_state.a_s_tag.find(s=>{return s == o_state.s_tag})){
        o_state.a_s_tag.push(o_state.s_tag)
        o_state.s_tag = ''
    }
}


globalThis.f_o_toast = f_o_toast
let o_el_svg = null;
// then we build the html
f_o_toast('this is info', 'info', 5000)
f_o_toast('this is warning','warning', 5000)
f_o_toast('this is error','error', 5000)
f_o_toast('this will take a while','loading', 5000)


let o = await f_o_html_from_o_js(
    {
        class: "test",
        style: "display: flex;flex-direction: row;",
        f_a_o: ()=>{
            return [
                {
                    id: "editor", 
                    style: 'width:50vw;height: 100vh;'
                },
                { 
                    style: 'width:50vw;height: 100vh;',
                    f_a_o: ()=>{
                        return [
                            {
                                id: 'canvas',
                                style: 'height: 100vh;position:relative', 
                                f_a_o: ()=>{
                                    return [
                                        {
                                            class: "inputs", 
                                            style: "position: absolute;top:0",
                                            f_a_o: ()=>[
                                                f_o_js_a_o_toast(o_state),
                                                {
                                                    s_tag: "button", 
                                                    innerText: "upload to sketchfab", 
                                                    onclick: ()=>{
                                                        o_state.b_show_sketchfab_upload_inputs = !o_state.b_show_sketchfab_upload_inputs;
                                                    }, 
                                                    a_s_prop_sync: 'b_show_sketchfab_upload_inputs',
                                                },
                                                {
                                                    f_b_render:()=> o_state.b_show_sketchfab_upload_inputs, 
                                                    a_s_prop_sync: 'b_show_sketchfab_upload_inputs',
                                                    f_a_o: ()=>{
                                                        return [
                                                            {
                                                                s_tag: 'label', 
                                                                innerText: "Name"
                                                            },
                                                            {
                                                                s_tag: 'input', 
                                                                a_s_prop_sync: 's_name',
                                                            },
                                                            {
                                                                s_tag: 'label', 
                                                                innerText: "Description"
                                                            },
                                                            {
                                                                s_tag: 'textarea', 
                                                                a_s_prop_sync: 's_description',
                                                                rows: 5, 
                                                                cols: 20,
                                                            },
                                                            {
                                                                s_tag: "button",
                                                                innerText: "generate description with AI (deepseek)", 
                                                                onclick: ()=>{
                                                                    const url = 'https://api.deepseek.com/chat/completions';  
                                                                    const requestData = {
                                                                      model: "deepseek-chat",
                                                                      messages: [
                                                                        {"role": "system", "content": "You are a helpful assistant."},
                                                                        {"role": "user", "content": "Write a description for a 3D model of a vase. It will be uploaded to sketchfab. It is not printed and therefore not tested but should be printable with the 'vase-mode' in any 3d printing slicing software. I give you this timestamp so that you will generate an output that is not always the same. The timestamp is: "+Date.now()},
                                                                      ],
                                                                      stream: false
                                                                    };
                                                                    
                                                                    fetch(url, {
                                                                      method: 'POST',
                                                                      headers: {
                                                                        'Content-Type': 'application/json',
                                                                        'Authorization': `Bearer ${o_state.s_api_token_deepseek}`
                                                                      },
                                                                      body: JSON.stringify(requestData)
                                                                    })
                                                                    .then(async response => {
                                                                      if (!response.ok) {
                                                                        throw new Error(`HTTP error! status: ${response.status}`);
                                                                      }
                                                                      let o = await response.json();
                                                                      let s = o?.choices[0]?.message?.content;
                                                                        if(s){
                                                                            o_state.s_description = s;
                                                                        }
                                                                    //   let o_example_response = {
                                                                    //     "id": "d5113375-ed6a-413e-90b6-ac17a6493142",
                                                                    //     "object": "chat.completion",
                                                                    //     "created": 1744360229,
                                                                    //     "model": "deepseek-chat",
                                                                    //     "choices": [
                                                                    //         {
                                                                    //             "index": 0,
                                                                    //             "message": {
                                                                    //                 "role": "assistant",
                                                                    //                 "content": "Hello! 😊 How can I assist you today?"
                                                                    //             },
                                                                    //             "logprobs": null,
                                                                    //             "finish_reason": "stop"
                                                                    //         }
                                                                    //     ],
                                                                    //     "usage": {
                                                                    //         "prompt_tokens": 11,
                                                                    //         "completion_tokens": 11,
                                                                    //         "total_tokens": 22,
                                                                    //         "prompt_tokens_details": {
                                                                    //             "cached_tokens": 0
                                                                    //         },
                                                                    //         "prompt_cache_hit_tokens": 0,
                                                                    //         "prompt_cache_miss_tokens": 11
                                                                    //     },
                                                                    //     "system_fingerprint": "fp_3d5141a69a_prod0225"
                                                                    //     }
                                                                    })
                                                                    .then(data => {
                                                                      console.log('Response:', data);
                                                                      // Handle the response data here
                                                                    })
                                                                    .catch(error => {
                                                                      console.error('Error:', error);
                                                                      // Handle errors here
                                                                    });
                                                                }
                                                            },
                                                            {
                                                                s_tag: 'label', 
                                                                innerText: "Tags"
                                                            },
                                                            {
                                                                a_s_prop_sync: 'a_s_tag',
                                                                f_a_o: ()=>{
                                                                    return o_state.a_s_tag.map(s=>{
                                                                        return {
                                                                            s_tag: 'input', 
                                                                            readonly: 'true', 
                                                                            value:`${s} x`, 
                                                                            onclick: ()=>{
                                                                                o_state.a_s_tag 
                                                                                    = o_state.a_s_tag.filter(
                                                                                        s2=>{return s2 != s}
                                                                                    )
                                                                            }
                                                                        }
                                                                    })
                                                                }
                                                            },
                                                            {
                                                                s_tag: 'input', 
                                                                a_s_prop_sync: 's_tag',  
                                                                onkeydown: (o_e)=>{
                                                                    if(o_e.key == 'Enter'){
                                                                        f_add_tag();
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                s_tag: "button", 
                                                                innerText: "add tag",
                                                                onclick: ()=>{
                                                                    f_add_tag();
                                                                }
                                                            },
                                                            {
                                                                s_tag: 'label', 
                                                                innerText: "API Token (sketchfab)"
                                                            },
                                                            {
                                                                s_tag: 'input', 
                                                                a_s_prop_sync: 's_api_token_sketchfab',
                                                            },
                                                            {
                                                                s_tag: 'label', 
                                                                innerText: "API Token (Deepseek)"
                                                            },
                                                            {
                                                                s_tag: 'input', 
                                                                a_s_prop_sync: 's_api_token_deepseek',
                                                            },
                                                            {
                                                                s_tag: 'button', 
                                                                innerText: "UPLOAD!", 
                                                                onclick: async ()=>{

                                                                    let o_license =     {
                                                                        "uri": "https://api.sketchfab.com/v3/licenses/b9ddc40b93e34cdca1fc152f39b9f375",
                                                                        "label": "CC Attribution-ShareAlike",
                                                                        "fullName": "Creative Commons Attribution-ShareAlike",
                                                                        "requirements": "Author must be credited. Modified versions must have the same license. Commercial use is allowed.",
                                                                        "url": "http://creativecommons.org/licenses/by-sa/4.0/",
                                                                        "slug": "by-sa"
                                                                      };
                                                                      let o_category =  {
                                                                        "uid": "e56c5de1e9344241909de76c5886f551",
                                                                        "name": "Art & Abstract",
                                                                        "slug": "art-abstract",
                                                                        "uri": "https://api.sketchfab.com/v3/categories/e56c5de1e9344241909de76c5886f551",
                                                                        "icon": "https://static.sketchfab.com/static/builds/web/dist/static/assets/images/icons/categories/876106eddb2a54aa1391eb2f4db0acb2-v2.svg",
                                                                        "thumbnails": [
                                                                          {
                                                                            "width": "512",
                                                                            "height": "288",
                                                                            "url": "https://static.sketchfab.com/categories/e56c5de1e9344241909de76c5886f551/512x288.png"
                                                                          },
                                                                          {
                                                                            "width": "800",
                                                                            "height": "450",
                                                                            "url": "https://static.sketchfab.com/categories/e56c5de1e9344241909de76c5886f551/800x450.png"
                                                                          }
                                                                        ]
                                                                      }

                                                                    // 1. Prepare metadata (matches browser payload)
                                                                    const payload = {
                                                                        name: o_state.s_name,
                                                                        description: o_state.s_description,
                                                                        tags:o_state.a_s_tag,
                                                                        categories: [o_category.slug], // UUID for "Art" category
                                                                        visibility: "public",
                                                                        private: false, // false = downloadable
                                                                        isInspectable: true,
                                                                        license: o_license.slug,
                                                                        isPublished: true,
                                                                    };

                                                                    f_generate_stl();

                                                                      // Create a FormData object
                                                                    const formDataObj = new FormData();

                                                                    // Append all the simple fields
                                                                    for (const key in payload) {
                                                                        if (Array.isArray(payload[key])) {
                                                                        // For array fields (tags, categories), add each item on a new line
                                                                        formDataObj.append(key, payload[key].join('\n'));
                                                                        } else {
                                                                        formDataObj.append(key, payload[key]);
                                                                        }
                                                                    }

                                                                    formDataObj.append("modelFile", o_blob_stl, `${o_state.s_name}.stl` );
  
                                                                    
                                                                    // 4. Upload
                                                                    let o_toast = f_o_toast('uploading model, please wait','loading', 50000)
                                                                    
                                                                    const response = await fetch("https://api.sketchfab.com/v3/models", {
                                                                        method: "POST",
                                                                        headers: {
                                                                            "Authorization": `Token ${o_state.s_api_token_sketchfab}`,
                                                                        },
                                                                        body: formDataObj,
                                                                    });

                                                                    if (response.ok) {
                                                                    const data = await response.json();
                                                                        console.log("✅ Upload success! Model URL:", data.uri);
                                                                        f_o_toast(`✅ Upload success! Model URL:${data.uri}`,'success')
                                                                        o_toast.f_hide();
                                                                    } else {
                                                                        console.error("❌ Upload failed:", await response.text());
                                                                        f_o_toast(`❌ Upload failed:", await ${response.text()}`, 'error')
                                                                        o_toast.f_hide();
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                {
                                                    s_tag: "button", 
                                                    innerText: "download", 
                                                    onclick: ()=>{
                                                        f_generate_stl();
                                                        f_download_stl();
                                                    }
                                                }, 
                                                {
                                                    s_tag: "select", 
                                                    f_a_o: ()=>{
                                                        return [
                                                            ...o_state.a_o_function.map(o=>{
                                                                return {
                                                                    s_tag: "option", 
                                                                    value: o.s_name, 
                                                                    innerText: o.s_name
                                                                }
                                                            }), 
                                                            {
                                                                s_tag: 'option', 
                                                                value: 'new', 
                                                                innerText: "new"
                                                            }
                                                        ]
                                                    }, 
                                                    onchange: (o_e)=>{
                                                        let s_name = o_e.target.value;
                                                        if(s_name == 'new'){
                                                            o_state.o_function = {s_name: 'new', s_function:o_monaco_editor.getValue()}
                                                            o_state.a_o_function.push(o_state.o_function)
                                                        }else{
                                                            o_state.o_function = o_state.a_o_function.find(o=>{return o.s_name == s_name});
                                                        }
                                                        o_state.s_name = o_state.o_function.s_name
                                                        f_update_from_o_function(o_state.o_function)
                    
                                                    }
                                                }, 
                                                {
                                                    s_tag: "input", 
                                                    a_s_prop_sync: `s_name`
                                                }, 
                                                {
                                                    f_a_o: ()=>{
                                                        let a_s_prop = Object.keys(o_state.ov);
                                                        return a_s_prop.map(s_prop=>{
                                                            let v = o_state.ov[s_prop];
                                                            if(v.n_min)
                                                            return {
                                                                f_a_o: ()=>{
                                                                    return [
                                                                        {
                                                                            f_s_innerText: ()=>s_prop
                                                                        },
                                                                        (v.n_min) ? {
                                                                            s_tag: 'input', 
                                                                            type: 'range',
                                                                            a_s_prop_sync: `ov.${s_prop}.n`,
                                                                            min: v?.n_min,
                                                                            max: v?.n_max, 
                                                                            oninput: ()=>{
                                                                                f_update_rendering();
                                                                            }
                                                                        }: {
                                                                            s_tag: 'input', 
                                                                            type:  'number',
                                                                            a_s_prop_sync: `ov.${s_prop}}`,
                                                                            oninput: ()=>{
                                                                                f_update_rendering();
                                                                            }
                                                                        }
                                                                        
                                                                    ]
                                                                }
                                                                
                                                            }
                                                        })
                                                    },
                                                    a_s_prop_sync: 'n_ts_ov_changed'
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            
                        ]
                    }
                }
            ]
        }
    }, 
    o_state
)
document.body.appendChild(o);

function f_o_sphere_cap(point, radius, material) {
    const sphereGeometry = new THREE.SphereGeometry(radius, 16, 16);
    const sphere = new THREE.Mesh(sphereGeometry, material);

    // Position the sphere at the given point
    sphere.position.set(point.n_trn_x, point.n_trn_y, 0);

    return sphere;
}

function f_a_o_cylinder_and_spheres_between_points(point1, point2, radius, material) {
    const p1 = new THREE.Vector3(point1.n_trn_x, point1.n_trn_y, 0);
    const p2 = new THREE.Vector3(point2.n_trn_x, point2.n_trn_y, 0);

    // Compute direction and length
    const direction = new THREE.Vector3().subVectors(p2, p1);
    const length = direction.length();

    if (length <= 0) {
        console.warn("Skipping zero-length cylinder.");
        return []; // Return empty array to avoid errors
    }

    // Calculate midpoint
    const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    // Create cylinder geometry
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 16);
    const cylinder = new THREE.Mesh(geometry, material);

    // Align cylinder with the direction
    cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

    // Position at midpoint
    cylinder.position.copy(midPoint);


    return [
        cylinder, 
        ...(o_state.b_add_circle_caps ? [
            f_o_sphere_cap(point1, radius, material),
            f_o_sphere_cap(point2, radius, material)
        ] : [])
    ];
}

function f_o_mesh_torus(o_center, n_radius, n_thickness = 0.5, n_segments = 32, material) {
    const o_geometry = new THREE.TorusGeometry(n_radius, n_thickness, n_segments, 32);
    const o_mesh = new THREE.Mesh(o_geometry, material);
    o_mesh.position.set(o_center.n_trn_x, o_center.n_trn_y, 0);
    return o_mesh;
}

let f_generate_stl = function(){
    const o_exporter = new STLExporter();
    
    // Create a temporary group to hold all meshes
    const o_temp_group = new THREE.Group();
    
    // Collect and add all meshes to the group
    o_scene.traverse((o_child) => {
        if (o_child.isMesh) {
            // Clone the mesh to avoid modifying the original scene
            o_temp_group.add(o_child.clone());
        }
    });

    // Export the entire group as binary STL
    const a_binary = o_exporter.parse(o_temp_group, { binary: true });

    // Download
    o_blob_stl = new Blob([a_binary], { type: 'application/octet-stream'});

    // Clean up
    o_temp_group.clear();

}
let f_download_stl = function(){

    const o_el_a = document.createElement('a');
    o_el_a.href = URL.createObjectURL(o_blob_stl);
    o_el_a.download = `${o_state.s_name}.stl`;
    o_el_a.click();
    
}



function createThreeJSObjects(a_o_mesh) {
    // Clear only the world group, not the entire scene
    while(o_world_group.children.length) {
        o_world_group.remove(o_world_group.children[0]);
    }

    a_o_mesh.forEach(o=>{
        o_world_group.add(o)
        // o_scene.add(o)
    })

    // fitCameraToGroup(o_camera, o_world_group);
}


function fitCameraToGroup(camera, group, offsetFactor = 1.2) {
    // 1. Create a bounding box that contains all objects in the group
    const box = new THREE.Box3().setFromObject(group);
    
    // 2. Get the center of the group
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    // 3. Get the size of the group
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // 4. Calculate optimal camera distance
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * offsetFactor;
    
    // For orthographic camera (if you're using one)
    if (camera.isOrthographicCamera) {
        cameraZ = maxDim * offsetFactor;
        camera.left = -size.x / 2 * offsetFactor;
        camera.right = size.x / 2 * offsetFactor;
        camera.top = size.y / 2 * offsetFactor;
        camera.bottom = -size.y / 2 * offsetFactor;
        camera.near = -cameraZ * 10;
        camera.far = cameraZ * 10;
    }
    
    // 5. Position the camera
    camera.position.copy(center);
    camera.position.z += cameraZ;
    
    // 6. Make the camera look at the center
    camera.lookAt(center);
    
    // 7. Update camera and controls if needed
    camera.updateProjectionMatrix();
    if (typeof controls !== 'undefined') {
        controls.target.copy(center);
        controls.update();
    }
}

// Function to create a regular polygon
function createRegularPolygon(x, y, radius, corners, n_offset_radians = 0) {
    const vertices = [];
    for (let i = 0; i < corners; i++) {
        const angle = (Math.PI * 2 * i) / corners + n_offset_radians;
        const px = x + radius * Math.cos(angle);
        const py = y - radius * Math.sin(angle); // Flip y-axis for SVG
        vertices.push({ x: px, y: py });
    }
    // Close the loop by adding the first vertex again
    vertices.push(vertices[0]);
    return vertices;
}
// import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/+esm';


let f_update_rendering = async function(){
    // console.log('Content changed:', o_monaco_editor.getValue());
    let s = o_monaco_editor.getValue();
    let s_f = `(${s})()`;
    // console.log(s_f) 
    let o = document.querySelector(`#${s_id_error_msg}`);
    if(o){
        o.remove();
    }
    try {
        
        let a_o = await eval(s_f);
        createThreeJSObjects(a_o);
    } catch (error) {
        console.error('Evaluation error:', error);

        if (error.stack) {

            // Basic error message
            let errorMessage = `Error: ${error.message}`;
            
            // Try to extract line number
            const stackMatch = error.stack?.match(/<anonymous>:(\d+):(\d+)/);
            if (stackMatch) {
                const [_, line, column] = stackMatch.map(Number);
                errorMessage += `\n\nAt line ${line}, column ${column}`;
                
                // Get the problematic line of code
                const lines = o_monaco_editor.getValue().split('\n');
                if (lines[line - 1]) {
                    errorMessage += `\n\nProblematic code:\n${lines[line - 1]}`;
                }
            }
            
            // Show error to user - choose one method:
            
            // Option 1: Simple alert
            // alert(errorMessage);
            let o = document.createElement('div');
            o.innerText = errorMessage;
            o.id = s_id_error_msg;


            document.querySelector('#editor').appendChild(o)
            
        }
        

    }
    // let o_mesh = mergeMeshesWithVertexMerge(a_o,0.5);
    // console.log(a_o)
    
}
// require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.33.0/min/vs' }});
// require.config({ paths: { 'vs': './monaco-editor-0.52.2/package/min/vs' }});
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min/vs' }});

let o_monaco_editor = null;
require(['vs/editor/editor.main'], function() {
    o_monaco_editor = monaco.editor.create(document.getElementById('editor'), {
        value: '',
        language: 'javascript',
        theme: 'vs-dark'
    });
    // Listen for content changes
    o_monaco_editor.onDidChangeModelContent((event) => {
        clearTimeout(o_state.n_id_timeout_renderrefresh);
        o_state.n_id_timeout_renderrefresh = setTimeout(function(){

            f_update_rendering();
        },o_state.n_ms_timeout_renderrefresh)

    });

    f_update_from_o_function(o_state.o_function)

});

let f_update_from_o_function = function(o_function){
    if(o_monaco_editor){
        o_monaco_editor.setValue(
            o_function.s_function
        );
    }
}
globalThis.n_tau = Math.PI*2;


let f_a_o = function(){
    let f_o_vec2 = function(n_trn_x, n_trn_y){return {n_trn_x, n_trn_y}}
    let f_o_line = function(o_trn, o_trn2){return {o_trn, o_trn2}}
    let f_o_circle = function(o_trn, n_radius){return {o_trn, n_radius}}
    let f_o_reg_poly = function(o_trn, n_radius, n_corners, n_offset_radians){return {o_trn, n_radius, n_corners, n_offset_radians}}

    let n_its = 3.;
    let n_radius = 200; 
    let n_tau = Math.PI*2.;
    let a_o = [
        f_o_circle(
            f_o_vec2(0,0), n_radius
        ), 
        f_o_reg_poly(
            f_o_vec2(0,0),
            40, 
            4, 
            0.2
        )
    ]
    for(let n_it = 0.; n_it < n_its; n_it+=1){
        let n_it_nor = n_it / n_its;
        a_o.push(
            f_o_line(
                f_o_vec2(0,0), 
                f_o_vec2(
                    Math.cos(n_it_nor*n_tau)*n_radius, 
                    Math.sin(n_it_nor*n_tau)*n_radius
                )
            )
        )
    }
    return a_o

}

// let a_o_test = f_a_o();
// console.log(a_o_test)
// drawObjectsToDXFAndSVG(a_o_test);
// const blob = new Blob([o_dxf.stringify()], { type: "application/dxf" });
// const link = document.createElement("a");
// link.href = URL.createObjectURL(blob);
// link.download = `atest.dxf`;
// link.click();

// Create a scene, camera, and renderer
const o_scene = new THREE.Scene();

// Add a grid helper to show the ground plane
const gridHelper = new THREE.GridHelper(1000, 100, 0x555555, 0x333333);
// Rotate the grid to be flat on XZ plane (default is XY)
gridHelper.rotation.x = Math.PI / 2; // Rotate 90 degrees around X axis

o_scene.add(gridHelper);



globalThis.o_scene = o_scene
o_scene.background = new THREE.Color(0x111111); // Dark background for contrast

const o_world_group = new THREE.Group(); // This will contain all objects
o_scene.add(o_world_group);

const o_camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Aspect ratio 1 for square canvas
globalThis.o_camera = o_camera


o_camera.position.set(3.6577695813301743, -431.2580386693436,  237.3374585409182)

const o_renderer = new THREE.WebGLRenderer({ antialias: true });
// o_renderer.setSize(500, 500);
document.querySelector('#canvas')?.appendChild(o_renderer.domElement);
let f_resize_renderer = function(){
    let o_bounds = o_renderer.domElement.parentElement.getBoundingClientRect();
    console.log(o_renderer.domElement.parentElement);
    o_renderer.setSize(o_bounds.width, o_bounds.height, false);
    
    // Update camera aspect ratio
    o_camera.aspect = o_bounds.width / o_bounds.height;
    o_camera.updateProjectionMatrix();
}
f_resize_renderer();



const light = new THREE.PointLight( 0xffffff, 1); // soft white light
light.position.set(10,10,10)
o_scene.add( light );
// 2. Improve camera light
// const cameraLight = new THREE.DirectionalLight( 0xffffff, 1 );
// // 3. Add a second directional light from opposite side
// const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
// fillLight.position.set(-5, 5, 5);
// o_scene.add(fillLight);

// Add orbit controls
const o_controls = new OrbitControls(o_camera, o_renderer.domElement);
o_controls.enableDamping = true;
o_controls.dampingFactor = 0.05;

// Disable default camera rotation
// o_controls.enableRotate = true;
// o_controls.rotateSpeed = 1.0;
// Animation loop
function animate() {
    requestAnimationFrame(animate);


    light.position.set(
        o_camera.position.x,
        o_camera.position.y,
        o_camera.position.z,
    ); // Position in front of camera

    // Clean up invalid objects
    // o_world_group.traverse(o_child => {
    //     if (o_child.isMesh && !o_child.geometry) {
    //         o_world_group.remove(o_child);
    //     }
    // });

    if (o_scene && o_camera && o_renderer) {
        o_renderer.render(o_scene, o_camera);
    }
    // o_controls.update();
    o_renderer.render(o_scene, o_camera);
}
animate();



window.onresize = function(){
    f_resize_renderer();
    o_monaco_editor.layout();
}
// for(let n = 0; n< 100; n+=1){

//     let v = perlin.get(n*0.1,n)
//     console.log(v)
// }