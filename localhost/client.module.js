
import {
    f_add_css,
    f_s_css_prefixed,
    o_variables, 
    f_s_css_from_o_variables
} from "https://deno.land/x/f_add_css@2.0.0/mod.js"

import {
    f_o_html_from_o_js,
    f_o_proxified_and_add_listeners
} from "https://deno.land/x/handyhelpers@5.2.3/mod.js"

import * as THREE from '/three.js-r126/build/three.module.js';
import { OrbitControls } from '/three.js-r126/examples/jsm/controls/OrbitControls.js';
import { STLExporter } from '/three.js-r126/examples/jsm/exporters/STLExporter.js';
import { ConvexGeometry } from '/three.js-r126/examples/jsm/geometries/ConvexGeometry.js';
import { SimplifyModifier } from '/three.js-r126/examples/jsm/modifiers/SimplifyModifier.js';

import { BufferGeometryUtils } from '/three.js-r126/examples/jsm/utils/BufferGeometryUtils.js';
// import { STLExporter } from '/three/STLExporter.js';
// if you need more addons/examples download from here...
//  

o_variables.n_rem_font_size_base = 1. // adjust font size, other variables can also be adapted before adding the css to the dom
o_variables.n_rem_padding_interactive_elements = 0.5; // adjust padding for interactive elements 
f_add_css(
    `
    body{
        min-height: 100vh;
        min-width: 100vw;
    }

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
let f_o_vec = function(n_x, n_y, n_z){return {n_x, n_y, n_z}}
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
let f_o_shaded_mesh = function(
    o_geometry,
    n_color = 0x6bb9f2,
    n_edge_color = 0x000000,
    n_edge_width = 0.0002
){
    // 1. Create the shaded material (Phong for nice lighting)
    const o_shaded_material = new THREE.MeshPhongMaterial({
        color: 0xCBC3E3,    // red (can also use a CSS color string here)
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
function mergeClosePoints(points, threshold = 0.001) {
    let mergedPoints = [];
    let usedIndices = new Set();
    
    for (let i = 0; i < points.length; i++) {
        if (usedIndices.has(i)) continue;
        
        let current = points[i];
        let similarPoints = [current];
        
        // Find all points close to current point
        for (let j = i + 1; j < points.length; j++) {
            if (usedIndices.has(j)) continue;
            
            let distance = current.distanceTo(points[j]);
            if (distance < threshold) {
                similarPoints.push(points[j]);
                usedIndices.add(j);
            }
        }
        
        // Calculate average position
        let average = new THREE.Vector3();
        similarPoints.forEach(p => average.add(p));
        average.divideScalar(similarPoints.length);
        
        mergedPoints.push(average);
    }
    
    return mergedPoints;
}

let a_o_function = [
    f_o_function(
        'example_merge', 
        function(){
            let f_o_extruded_mesh = function(a_o_p, n_extrusion){
                let a_o_point = a_o_p.map(o => new THREE.Vector3(o.n_x, o.n_y, o.n_z));
                    console.log('before')
                    console.log(a_o_point.length)
                    let mergeThreshold = 0.2;
                    // Merge close points before creating shape
                    if (mergeThreshold > 0) {
                        a_o_point = mergeClosePoints(a_o_point, mergeThreshold);
                    }
                    console.log('after')
                    console.log(a_o_point.length)
                    
                    // Ensure we have enough points after merging
                    if (a_o_point.length < 3) {
                        console.error("Not enough points after merging");
                        return null;
                    }

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
                    let n_amp = n_radius_1+Math.sin(n_it_nor*n_tau*10)*(Math.sin(n_it_nor*n_tau*3)*.5+.5)*10;
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
            let n_layer_height_mm = 0.2;///2. for more precision, subsampling
            let n_height = 150.;
            let n_corners = 100.;
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
                n_it_nor
            ){
                let n_its_subsample = 10;
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
                    const intermediatePoints = [];
                    for (let n_it_subsample = 0; n_it_subsample < n_its_subsample; n_it_subsample++) {
                        const t = n_it_subsample / n_its_subsample; // Interpolation factor [0, 1)
                        const x = o_trn1.x + t * (o_trn2.x - o_trn1.x);
                        const y = o_trn1.y + t * (o_trn2.y - o_trn1.y);
                        const z = o_trn1.z + t * (o_trn2.z - o_trn1.z);
                    
                        const o_trn = f_o_vec(x, y, z);
                        intermediatePoints.push(o_trn);
                    }
                });
                let a_o2 = [];
                for(let n = 0; n< a_o.length; n+=1){
                    let n
                }
                return a_o
            }
            let n_tau = Math.PI*2;
            let n_layer_height_mm = 10.//0.2;///2; for more precision, subsampling, but slower!
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
    )
]
let o_div = document;
let o_state = f_o_proxified_and_add_listeners(
    {
        n_ts_ov_changed: false, 
        ov: {},
        b_add_circle_caps: true,
        s_name: "asdf",// ugly work around
        o_function: null,
        a_o_function: a_o_function
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


let o_el_svg = null;
// then we build the html 
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
                                                {
                                                    s_tag: "button", 
                                                    innerText: "download", 
                                                    onclick: ()=>{
                                                        f_export_stl();
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

function f_export_stl() {
    const o_exporter = new STLExporter();
    
    // Option 1: Export all meshes as separate objects in one STL
    let s_stl = '';
    o_scene.traverse((o_child) => {
        if (o_child.isMesh) {
            s_stl += o_exporter.parse(o_child, { binary: false });
        }
    });

    // Download
    const o_blob = new Blob([s_stl], { type: 'text/plain' });
    const o_el_a = document.createElement('a');
    o_el_a.href = URL.createObjectURL(o_blob);
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

    fitCameraToGroup(o_camera, o_world_group);
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


let f_update_rendering = function(){
    // console.log('Content changed:', o_monaco_editor.getValue());
    let s = o_monaco_editor.getValue();
    let s_f = `(${s})()`;
    // console.log(s_f)  
    let a_o = eval(s_f);
    // let o_mesh = mergeMeshesWithVertexMerge(a_o,0.5);
    // console.log(a_o)
    
    createThreeJSObjects(a_o);
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
        f_update_rendering();

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
globalThis.o_scene = o_scene
o_scene.background = new THREE.Color(0x111111); // Dark background for contrast

const o_world_group = new THREE.Group(); // This will contain all objects
o_scene.add(o_world_group);

const o_camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Aspect ratio 1 for square canvas
globalThis.o_camera = o_camera

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
    o_world_group.traverse(o_child => {
        if (o_child.isMesh && !o_child.geometry) {
            o_world_group.remove(o_child);
        }
    });

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