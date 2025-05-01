async function() {
    let o_mod = await import("./threejs_custom_extrusions.js");
    // Create pentagonal star shape
    // Extrude settings
    let n_extrude_base = 0.6;
    const extrudeSettings = {
        steps: 1,
        depth:n_extrude_base,
        bevelEnabled: false,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelOffset: 0,
        bevelSegments: 3
    };
    
    // Create the star geometry
    let n_corners = 6;
    let n_radius_outer = 20;
    let n_radius_inner = 10;
    const starShape = o_mod.f_o_shape_star(n_corners, n_radius_outer, n_radius_inner);
    const o_geo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    
    let n_width = 0.6;
    let n_z = 1;
    
    let a_o_mesh = []
    let n_its = 5;
    for(let n_it = 0; n_it <= n_its; n_it +=1){
        let n_it_nor = n_it / n_its; 
        a_o_mesh.push(
            ...o_mod.f_a_o_mesh_linestar(
                n_corners, 
                n_radius_outer*n_it_nor, 
                n_radius_inner*n_it_nor, 
                n_width, 
                n_z, 
            )
        )
    }
    
    const o_mesh = f_o_shaded_mesh(o_geo);
    
    let n_radius_ring_inner = 2; 
    let n_radius_ring_outer = 3;
    let o_extruded_mesh = o_mod.f_o_extruded_ring(n_radius_ring_inner,n_radius_ring_outer, n_extrude_base, 128);
    let o_mesh_ring = f_o_shaded_mesh(o_extruded_mesh);
    o_mesh_ring.position.set(
        Math.sin(n_tau/n_corners)*(n_radius_inner+n_radius_ring_inner/2), 
        Math.cos(n_tau/n_corners)*(n_radius_inner+n_radius_ring_inner/2)
    )
    
    
    return [o_mesh, ...a_o_mesh, o_mesh_ring]
    
    }