function() {
    
    const n_tau = Math.PI * 2;
    // all units in millimeter mm
    let n_height = 100.;
    let n_layer_height = 0.2;
    let n_its_layer = parseInt(n_height / n_layer_height);
    let a_o_geometry = []
    let n_corners = 1000.;
    let a_o_p_outside = [];
    let n_radius_base = n_height*.3;
    // const phi = (1 + Math.sqrt(5)) / 2;


let f_o_p_on_polygon = function (n_corner_nor, n_sides = 5, radius = 1, n_rad_offset=0) {
// Ensure n_sides is at least 3 (triangle)
n_sides = Math.max(3, n_sides);

// Calculate which polygon side the point lies on
const side_index = Math.floor(n_corner_nor * n_sides) % n_sides;
const t = (n_corner_nor * n_sides) % 1; // Position along the side (0 to 1)

// Angles of the two vertices of the current side
const angle1 = (side_index / n_sides) * 2 * Math.PI;
const angle2 = ((side_index + 1) / n_sides) * 2 * Math.PI;

// Coordinates of the two vertices
const x1 = Math.sin(angle1+n_rad_offset) * radius;
const y1 = Math.cos(angle1+n_rad_offset) * radius;
const x2 = Math.sin(angle2+n_rad_offset) * radius;
const y2 = Math.cos(angle2+n_rad_offset) * radius;

// Interpolate between the two vertices
const n_x = x1 + t * (x2 - x1);
const n_y = y1 + t * (y2 - y1);

return { n_x, n_y };
}

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
            let n_sinbig = Math.sin(n_it_nor_corner*5.*n_tau*.5);
            let n_pc = 6;
            let n_nor_side = (n_it_nor_corner*n_pc)%1;
            let nx2 = n_nor_side; 
            nx2 = Math.pow(nx2-0.5, 2)*-4.+1.;
            let nint = Math.sin(n_it_layer_nor*12.*n_tau)*.2;
            n_amp-= nx2*5.*nint;
            n_amp += Math.sin(n_it_layer_nor*0.96*n_tau)*n_radius_base*0.5;
            let n_rad_offset = n_it_layer_nor*n_tau/n_pc;
            let o_trn =  f_o_p_on_polygon(n_it_nor_corner,n_pc, n_amp, n_rad_offset)

            let o_trn1 = f_o_vec( //this would be the point that is on the corner of the polygon
                o_trn.n_x,
                o_trn.n_y,
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
                f_o_geometry_from_a_o_p_polygon_face([f_o_vec(0, 0, a_o_p[0].n_z), ...a_o_p])
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