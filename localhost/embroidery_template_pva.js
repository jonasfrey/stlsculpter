
function(){
    // Create two meshes
    let n_extr_base = 0.2;
    let n_scl_x_pixel = 1
    let n_scl_y_pixel = 1;
    let n_scl_margin_pixel_x = n_scl_x_pixel*0.8;
    let n_scl_margin_pixel_y = n_scl_x_pixel*0.8;

    let n_pixels_x = 20;
    let n_pixels_y = 20;


    const o_mat_plane = new THREE.MeshStandardMaterial({ color: 0x00ff00 });


    const o_geo_plane = new THREE.BoxGeometry(
        n_pixels_x * (n_scl_x_pixel+n_scl_margin_pixel_x)+n_scl_margin_pixel_x*2,
        n_pixels_y * (n_scl_y_pixel+n_scl_margin_pixel_y)+n_scl_margin_pixel_y*2,
        n_extr_base
    );

    // let o_mesh_plane = f_o_shaded_mesh(o_geo_plane);
    let o_mesh_plane = new THREE.Mesh(o_geo_plane, o_mat_plane);
    let o_mesh_plane_original = o_mesh_plane.clone();

    let a_o_mesh_pixel = [];
    

    let o_box_csg_plane = o_mod_csg.CSG.fromMesh(o_mesh_plane);

    let n_trn_x = -n_pixels_x * (n_scl_x_pixel+n_scl_margin_pixel_x)/2;
    let n_trn_y = -n_pixels_y * (n_scl_y_pixel+n_scl_margin_pixel_y)/2;
    for(let n_it_x = 0; n_it_x < n_pixels_x; n_it_x++){
        for(let n_it_y = 0; n_it_y < n_pixels_y; n_it_y++){

            let o_geo_pixel = new THREE.BoxGeometry(
                n_scl_x_pixel, 
                n_scl_y_pixel, 
                n_extr_base*10
            );
            
            let o_mesh_pixel = new THREE.Mesh(o_geo_pixel, o_mat_plane);//f_o_shaded_mesh(o_geo_pixel);
     
            // a_o_mesh_pixel.push(o_mesh_pixel);
            o_mesh_pixel.position.x = n_trn_x+(n_it_x * (n_scl_x_pixel+n_scl_margin_pixel_x));
            o_mesh_pixel.position.y = n_trn_y+(n_it_y * (n_scl_y_pixel+n_scl_margin_pixel_y));
            o_mesh_pixel.position.z = -n_extr_base/2;
            o_mesh_pixel.updateMatrix(); // This is crucial!
            
            const o_csg_pixel = o_mod_csg.CSG.fromMesh(o_mesh_pixel);
            o_box_csg_plane = o_box_csg_plane.subtract(o_csg_pixel);  // Subtract


        }
    }
    o_mesh_plane = o_mod_csg.CSG.toMesh(o_box_csg_plane, o_mesh_plane.matrix, o_mat_plane);

    // const resultMesh = o_mod_csg.CSG.toMesh(o_box_csg_plane, o_mesh_plane.matrix, o_mat_plane);
    return [
        o_mesh_plane, 
        // ...a_o_mesh_pixel
    ];
}
