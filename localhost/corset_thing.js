
function(){

    // Create two meshes
    let n_layer_height = 0.3;
    let n_extr_base = n_layer_height;
    let n_scl_x_pixel = 5
    let n_scl_y_pixel = 5;
    let n_dia = Math.sqrt(Math.pow(n_scl_x_pixel,2)+Math.pow(n_scl_y_pixel,2))
    let n_pixels_x = 22;
    let n_pixels_y = 22;
    let n_scl_margin_pixel_x = n_dia/2;
    let n_scl_margin_pixel_y = n_dia/2;
    let n_scl_x = n_pixels_x*n_dia;
    let n_scl_y = n_pixels_y*n_dia;


    const o_mat_plane = new THREE.MeshStandardMaterial({ color: 0x00ff00 });


    const o_geo_plane = new THREE.BoxGeometry(
        n_scl_x,
        n_scl_y,
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

            // let o_pixel = o_stitch.a_o_pixel_black.find(
            //     o=>{
            //         return o.n_x == n_it_x && o.n_y == n_it_y
            //     }
            // );
            // if(!o_pixel){
            //     continue
            // }
            let n_it_x_nor = n_it_x/n_pixels_x;
            let n_it_y_nor = n_it_y/n_pixels_y;
            let n_amp = n_layer_height*5.;
            let n_z = n_extr_base
                +(Math.sin(
                    n_it_x_nor*n_tau*1.
                    +n_tau*.5*(n_it_y%2)
                )*.5+.5)*n_amp;
                // +(Math.sin(n_it_y_nor*3.*n_tau)*.5+.5);
            let o_geo_pixel = new THREE.BoxGeometry(
                n_scl_x_pixel, 
                n_scl_y_pixel, 
                n_z
            );
            
            let o_mesh_pixel = new THREE.Mesh(o_geo_pixel, o_mat_plane);//f_o_shaded_mesh(o_geo_pixel);
     
            // a_o_mesh_pixel.push(o_mesh_pixel);
            
            o_mesh_pixel.position.x = n_dia*n_it_x-n_scl_x/2;
            o_mesh_pixel.position.y = (n_dia*n_it_y/2)-n_scl_y/2;
            o_mesh_pixel.position.x += (n_it_y%2)*n_dia/2
            o_mesh_pixel.position.z = n_z/2;
            
            o_mesh_pixel.rotation.z = n_tau/8;
            
            o_mesh_pixel.updateMatrix(); // This is crucial!
            
            const o_csg_pixel = o_mod_csg.CSG.fromMesh(o_mesh_pixel);
            o_box_csg_plane = o_box_csg_plane.union(o_csg_pixel);  // Subtract


        }
    }
    o_mesh_plane = o_mod_csg.CSG.toMesh(o_box_csg_plane, o_mesh_plane.matrix, o_mat_plane);

    // const resultMesh = o_mod_csg.CSG.toMesh(o_box_csg_plane, o_mesh_plane.matrix, o_mat_plane);
    return [
        o_mesh_plane, 
        // ...a_o_mesh_pixel
    ];
}
