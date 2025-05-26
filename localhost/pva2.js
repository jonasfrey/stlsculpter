
function(){

     // Parameters
 const n_extr_base = 0.2;
 const n_scl_x_pixel = 1;
 const n_scl_y_pixel = 1;
 const n_scl_margin_pixel_x = 0.05;
 const n_scl_margin_pixel_y = 0.05;
 const n_pixels_x = 20;
 const n_pixels_y = 20;

 // Create base material
 const o_mat_plane = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

 // Create base plane geometry
 const o_geo_plane = new THREE.BoxGeometry(
     n_pixels_x * (n_scl_x_pixel + n_scl_margin_pixel_x) + n_scl_margin_pixel_x * 2,
     n_pixels_y * (n_scl_y_pixel + n_scl_margin_pixel_y) + n_scl_margin_pixel_y * 2,
     n_extr_base
 );

 // Create initial CSG object from the base plane
 const o_mesh_plane = new THREE.Mesh(o_geo_plane, o_mat_plane);
 let currentCSG = o_mod_csg.CSG.fromMesh(o_mesh_plane);

 // Calculate starting position
 const n_trn_x = -n_pixels_x * (n_scl_x_pixel + n_scl_margin_pixel_x) / 2;
 const n_trn_y = -n_pixels_y * (n_scl_y_pixel + n_scl_margin_pixel_y) / 2;

 // Array to store all pixel meshes (for visualization if needed)
 const a_o_mesh_pixel = [];

 // Perform all subtractions in one CSG operation for better performance
 const subtractors = [];
 
 for (let n_it_x = 0; n_it_x < n_pixels_x; n_it_x++) {
     for (let n_it_y = 0; n_it_y < n_pixels_y; n_it_y++) {
         // Create pixel geometry
         const o_geo_pixel = new THREE.BoxGeometry(
             n_scl_x_pixel,
             n_scl_y_pixel,
             n_extr_base * 10
         );
         
         // Position the pixel
         const o_mesh_pixel = new THREE.Mesh(o_geo_pixel, o_mat_plane);
         o_mesh_pixel.position.x = n_trn_x + (n_it_x * (n_scl_x_pixel + n_scl_margin_pixel_x));
         o_mesh_pixel.position.y = n_trn_y + (n_it_y * (n_scl_y_pixel + n_scl_margin_pixel_y));
         o_mesh_pixel.position.z = -n_extr_base / 2;
         
         // Store for visualization if needed
         a_o_mesh_pixel.push(o_mesh_pixel);
         
         // Convert to CSG and add to subtractors array
         subtractors.push(o_mod_csg.CSG.fromMesh(o_mesh_pixel));
     }
 }

 // Perform all subtractions at once (more efficient)
 // Method 1: Subtract one by one (more accurate but slower)
//  let resultCSG = currentCSG;
//  for (const subtractor of subtractors) {
//      resultCSG = resultCSG.subtract(subtractor);
//  }

 // Method 2: Union all subtractors then subtract once (faster but may have artifacts)
 const combinedSubtractors = subtractors.reduce((acc, val) => acc.union(val));
 const resultCSG = currentCSG.union(combinedSubtractors);

 // Convert final CSG back to mesh
 const resultMesh = o_mod_csg.CSG.toMesh(resultCSG, o_mesh_plane.matrix, o_mat_plane);

 return [
     resultMesh,
     // ...a_o_mesh_pixel // Uncomment if you want to visualize the subtractors
 ];
}
