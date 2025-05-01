
import * as THREE from '/three.js-r126/build/three.module.js';


let f_o_shaded_mesh = function(
    o_geometry,
    o_material_options = {},
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
        ...o_material_options
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

let f_a_o_mesh_boxline = function(
    p1,
    p2,
    thickness = 0.1,
    n_extrusion = 0.1
) {
    // Calculate midpoint
    p1 = new THREE.Vector3( p1.x, p1.y, 0 );
    p2 = new THREE.Vector3( p2.x, p2.y, 0 );
    const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    
    // Calculate length
    const length = p1.distanceTo(p2);
    
    // Calculate angle
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    
    // Create box geometry
    const geometry = new THREE.BoxGeometry(length, thickness, n_extrusion);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const line = f_o_shaded_mesh(geometry)
    
    // Position and rotate
    line.position.copy(midpoint);
    line.rotation.z = angle;
    
    const o_geo_cyl1 = new THREE.CylinderGeometry( thickness/2, thickness/2, n_extrusion, 32 ); 
    let o_mesh_cyl1 = f_o_shaded_mesh(o_geo_cyl1);
    o_mesh_cyl1.rotation.set(n_tau/4, 0, 0)
    o_mesh_cyl1.position.set(p1.x, p1.y, p1.z);
        
    const o_geo_cyl2 = new THREE.CylinderGeometry( thickness/2, thickness/2, n_extrusion, 32 ); 
    let o_mesh_cyl2 = f_o_shaded_mesh(o_geo_cyl2);
    o_mesh_cyl2.rotation.set(n_tau/4, 0, 0)
    o_mesh_cyl2.position.set(p2.x, p2.y, p2.z);

    line.position.z = n_extrusion/2;
    o_mesh_cyl1.position.z = n_extrusion/2;
    o_mesh_cyl2.position.z = n_extrusion/2;
    return [line, o_mesh_cyl1, o_mesh_cyl2];
}

let f_a_o_mesh_boxline_layered = function(
    p1,
    p2,
    n_its_layer = 3,
    n_thick_base = 1,
    n_thick_per_layer = 0.2, 
    n_extrusion_base = 1,
    n_extrusion_per_layer = 0.2
) {

    let a_o = []
    for(let n_it_layer = 0; n_it_layer < n_its_layer; n_it_layer+=1){
        let n_it_layer_nor = n_it_layer/ n_its_layer;
        let n_it_layer_nor_inv = 1.-n_it_layer_nor;
        let n_extr = n_extrusion_base+n_it_layer*n_extrusion_per_layer
        let a_om = f_a_o_mesh_boxline(
            p1, 
            p2, 
            n_thick_base+n_it_layer_nor_inv*n_thick_per_layer,
            n_extr
        );
        a_o.push(
            ...a_om.map(o=>{
                // o.position.z += n_extr*20
                return o
            })
        )
    }
    return a_o
   
}

let f_a_o_mesh_cubicbezierboxregpoly = function(
    o_p1,
    o_p_controll,
    o_p2,
    n_radius = 10, 
    n_its_corner = 4, 
    n_radians_offset
){
    let a_o_mesh = []
    // const o_spline = new THREE.CatmullRomCurve3( [
    //     new THREE.Vector3( 10, 0, 0 ),
    //     new THREE.Vector3( 0, 0 ,0),
    //     new THREE.Vector3( 0, 10,0)
    // ]);
    // o_spline.curveType = 'catmullrom';
    // const o_cubic_bz = new THREE.CubicBezierCurve3(
    //     new THREE.Vector3( 0, 0 ,0),
    //     new THREE.Vector3( 10, 0, 0 ),
    //     new THREE.Vector3( 0, 10,0)
    // );

    const o_qubz = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3( o_p1.x, o_p1.y, (o_p1.z) ? o_p1.z : 0 ),
            new THREE.Vector3( o_p_controll.x, o_p_controll.y, (o_p_controll.z) ? o_p_controll.z : 0 ),
            new THREE.Vector3( o_p2.x, o_p2.y, (o_p2.z) ? o_p2.z : 0 ),
    );

    let o_curve = o_qubz


    // o_spline.closed = true;
    const extrudeSettings1 = {
        steps: 200,
        // bevelEnabled: false,
        extrudePath: o_curve
    };


    let n_tau = Math.PI*2.;
    let a_o_p = []
    for(let n_it_corner = 0; n_it_corner < n_its_corner; n_it_corner+=1){
        let n_it_corner_nor = n_it_corner / n_its_corner;
        // n_it_corner_nor+=1./n_its_corner/2
        if(!n_radians_offset){
            let n_ang_degrees_inner_corner = ((n_its_corner-2)*180)/n_its_corner
            let n_ang_offset_radians = ((180-(n_ang_degrees_inner_corner/2))/360)*n_tau
            console.log(n_ang_degrees_inner_corner/2);
            n_radians_offset = n_ang_offset_radians
        }
        a_o_p.push(
            new THREE.Vector3(
                Math.sin(n_it_corner_nor*n_tau+n_radians_offset)*n_radius,
                Math.cos(n_it_corner_nor*n_tau+n_radians_offset)*n_radius,
                0
            )
        )
    }

    const shape1 = new THREE.Shape( a_o_p );

    const geometry1 = new THREE.ExtrudeGeometry( shape1, extrudeSettings1 );
    a_o_mesh.push(
        f_o_shaded_mesh(geometry1)
    )

    return a_o_mesh;

}
let f_o_extruded_ring = function(
    n_radius_inner, 
    n_radius_outer, 
    n_extrusion = 2, 
    n_polygon_points = 32,
    n_nor_start = 0.,
    n_nor_end = 1.
){
    const shape = new THREE.Shape();
    // shape.moveTo( 0,0 );
    // shape.lineTo( 0, width );
    // shape.lineTo( length, width );
    // shape.lineTo( length, 0 );
    // shape.lineTo( 0, 0 );
    let o0 = {}
    let n_nor_range = n_nor_end-n_nor_start;
    
    for(let n= 0; n<=n_polygon_points; n+=1){
        let n_it_nor = ((n / n_polygon_points)*(n_nor_range/1) + n_nor_start);
        let o = {
            x: Math.sin(n_it_nor*n_tau)*n_radius_outer, 
            y: Math.cos(n_it_nor*n_tau)*n_radius_outer
        };
        if(n == 0){
            shape.moveTo( o.x, o.y );
            o0  = o;
        }else{
            shape.lineTo( o.x, o.y );
        }
    } 
    for(let n= n_polygon_points; n>=0; n-=1){
        let n_it_nor = ((n / n_polygon_points)*(n_nor_range/1) + n_nor_start);
        let o = {
            x: Math.sin(n_it_nor*n_tau)*n_radius_inner, 
            y: Math.cos(n_it_nor*n_tau)*n_radius_inner
        };

        shape.lineTo( o.x, o.y );
    } 
    shape.lineTo( o0.x, o0.y );
    const extrudeSettings = {
        steps: 2,
        depth: n_extrusion,
        bevelEnabled: false,
        bevelThickness: 0,
        bevelSize: 0,
        bevelOffset: 0,
        bevelSegments: 0
    };

    
    const geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
    return geometry
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // const mesh = new THREE.Mesh( geometry, material ) ;
    // scene.add( mesh );

}
let f_a_o_mesh_tangent_circles = function(
    n_radius_inner = 10,
    n_circles = 3,
    n_thickness = 2, 
    n_extrusion = 2, 
    b_show_inner = false
){
    
    let a_o_mesh = []
    let n_tau = Math.PI*2;
    let n_radius_tangent_circle =
        n_radius_inner
            *(Math.sin(n_tau/2./n_circles));

    let r2 = n_radius_tangent_circle;
    let a2 = n_tau / n_circles/2.; 
    let c2 = n_radius_inner; 
    let n_sin_c = c2 / (r2/Math.sin(a2));
    let c = Math.asin(n_sin_c);// unknown;
    // console.log(c);
    let b = (n_tau/2)-a2-c; 
    console.log({n_circles, b: (b/n_tau)*360});

    let n_radius_ring_inner = n_radius_inner-n_thickness;
    let n_radius_ring_outer = n_radius_inner+n_thickness;
    let n_circle_polygons = 128;
    let o_extruded_mesh = f_o_extruded_ring(n_radius_ring_inner,n_radius_ring_outer, n_extrusion, n_circle_polygons);
    let o_mesh = f_o_shaded_mesh(o_extruded_mesh);

    for(let n = 0; n< n_circles; n+=1){
        let n_nor = n/ n_circles;
        let o_p = {
            x: Math.sin(n_nor*n_tau)*n_radius_inner,
            y: Math.cos(n_nor*n_tau)*n_radius_inner
        }
        let n_rad_inner = n_radius_tangent_circle-n_thickness;
        let n_rad_outer = n_radius_tangent_circle+n_thickness;
        let o_extruded_mesh = f_o_extruded_ring(n_rad_inner,n_rad_outer, n_extrusion, n_circle_polygons);
        let o_mesh = f_o_shaded_mesh(o_extruded_mesh);
        o_mesh.position.set(
            o_p.x, 
            o_p.y, 
            0
        )
        a_o_mesh.push(o_mesh)
    }
    if(b_show_inner){

        a_o_mesh.push(o_mesh);
    }
    return a_o_mesh
}

let f_a_o_mesh_poi_circle1 = function(
    n_radius_inner = 10,
    n_circles = 3,
    n_thickness = 2, 
    n_extrusion = 2, 
    b_show_inner = false
){
    
    let a_o_mesh = []
    let n_tau = Math.PI*2;
    let n_radius_tangent_circle =
        n_radius_inner
            *(Math.sin(n_tau/2./n_circles));

    let r2 = n_radius_tangent_circle;
    let a2 = n_tau / n_circles/2.; 
    let c2 = n_radius_inner; 
    let n_sin_c = c2 / (r2/Math.sin(a2));
    let c = Math.asin(n_sin_c);// unknown;
    // console.log(c);
    let b = (n_tau/2)-a2-c; 
    console.log({n_circles, b: (b/n_tau)*360});
    let n_b_nor = b/n_tau;
    let n_rad2 = n_tau-(2*b);
    let n_rad2_nor = n_rad2 / n_tau;
    let n_nor_start = 0; 
    let n_nor_end = n_rad2_nor;
    let n_nor_range = n_nor_end-n_nor_start;
    console.log({n_nor_start, n_nor_end})
    let n_radius_ring_inner = n_radius_inner-n_thickness;
    let n_radius_ring_outer = n_radius_inner+n_thickness;
    let n_circle_polygons = 128;
    let o_extruded_mesh = f_o_extruded_ring(n_radius_ring_inner,n_radius_ring_outer, n_extrusion, n_circle_polygons);
    let o_mesh = f_o_shaded_mesh(o_extruded_mesh);

    for(let n = 0; n< n_circles; n+=1){
        let n_nor = n/ n_circles;
        let n_rot_nor = (n_b_nor+n_nor)%1;
        let o_p = {
            x: Math.sin(n_nor*n_tau)*n_radius_inner,
            y: Math.cos(n_nor*n_tau)*n_radius_inner
        }
        let n_rad_inner = n_radius_tangent_circle-n_thickness;
        let n_rad_outer = n_radius_tangent_circle+n_thickness;
        let o_extruded_mesh = f_o_extruded_ring(
            n_rad_inner,
            n_rad_outer,
            n_extrusion,
            n_circle_polygons, 
            n_nor_start+n_rot_nor, 
            n_nor_end+n_rot_nor
        );
        let o_mesh = f_o_shaded_mesh(o_extruded_mesh);
        o_mesh.position.set(
            o_p.x, 
            o_p.y, 
            0
        )
        a_o_mesh.push(o_mesh)
    }
    if(b_show_inner){

        a_o_mesh.push(o_mesh);
    }
    return a_o_mesh
}

let f_a_o_mesh_poi_circle2 = function(
    n_radius_inner = 10,
    n_circles = 3,
    n_thickness = 2, 
    n_extrusion = 2, 
    b_show_inner = false
){
    
    let a_o_mesh = []
    let n_tau = Math.PI*2;
    let n_radius_tangent_circle =
        n_radius_inner
            *(Math.sin(n_tau/2./n_circles));

    let r2 = n_radius_tangent_circle;
    let a2 = n_tau / n_circles/2.; 
    let c2 = n_radius_inner; 
    let n_sin_c = c2 / (r2/Math.sin(a2));
    let c = Math.asin(n_sin_c);// unknown;
    // console.log(c);
    let b = (n_tau/2)-a2-c; 
    console.log({n_circles, b: (b/n_tau)*360});
    let n_b_nor = b/n_tau;
    let n_rad2 = n_tau-(2*b);
    let n_rad2_nor = n_rad2 / n_tau;
    let n_nor_start = 0; 
    let n_nor_end = n_rad2_nor;
    let n_nor_range = n_nor_end-n_nor_start;
    console.log({n_nor_start, n_nor_end})
    let n_radius_ring_inner = n_radius_inner-n_thickness;
    let n_radius_ring_outer = n_radius_inner+n_thickness;
    let n_circle_polygons = 128;
    let o_extruded_mesh = f_o_extruded_ring(n_radius_ring_inner,n_radius_ring_outer, n_extrusion, n_circle_polygons);
    let o_mesh = f_o_shaded_mesh(o_extruded_mesh);

    for(let n = 0; n< n_circles; n+=1){
        let n_nor = n/ n_circles;
        let n_rot_nor = (n_b_nor+0.5+n_nor)%1;
        let o_p = {
            x: Math.sin(n_nor*n_tau)*n_radius_inner,
            y: Math.cos(n_nor*n_tau)*n_radius_inner
        }
        let n_rad_inner = n_radius_tangent_circle-n_thickness;
        let n_rad_outer = n_radius_tangent_circle+n_thickness;
        let o_extruded_mesh = f_o_extruded_ring(
            n_rad_inner,
            n_rad_outer,
            n_extrusion,
            n_circle_polygons, 
            n_nor_start+n_rot_nor, 
            n_nor_end+n_rot_nor
        );
        let o_mesh = f_o_shaded_mesh(o_extruded_mesh);
        o_mesh.position.set(
            o_p.x, 
            o_p.y, 
            0
        )
        a_o_mesh.push(o_mesh)
    }
    if(b_show_inner){

        a_o_mesh.push(o_mesh);
    }
    return a_o_mesh
}
let f_a_o_mesh_poi_circle3 = function(
    n_radius_inner = 10,
    n_circles = 3,
    n_thickness = 2, 
    n_extrusion = 2, 
    b_show_inner = false
){
    
    let a_o_mesh = []
    let n_tau = Math.PI*2;
    let n_radius_tangent_circle =
        n_radius_inner
            *(Math.sin(n_tau/2./n_circles));

    let r2 = n_radius_tangent_circle;
    let a2 = n_tau / n_circles/2.; 
    let c2 = n_radius_inner; 
    let n_sin_c = c2 / (r2/Math.sin(a2));
    let c = Math.asin(n_sin_c);// unknown;
    // console.log(c);
    let b = (n_tau/2)-a2-c; 
    console.log({n_circles, b: (b/n_tau)*360});
    let n_b_nor = b/n_tau;
    let n_rad2 = n_tau-(2*b);
    let n_rad2_nor = n_rad2 / n_tau;
    let n_nor_start = 0; 
    let n_nor_end = n_rad2_nor;
    let n_nor_range = n_nor_end-n_nor_start;
    console.log({n_nor_start, n_nor_end})
    let n_radius_ring_inner = n_radius_inner-n_thickness;
    let n_radius_ring_outer = n_radius_inner+n_thickness;
    let n_circle_polygons = 128;
    let o_extruded_mesh = f_o_extruded_ring(n_radius_ring_inner,n_radius_ring_outer, n_extrusion, n_circle_polygons);
    let o_mesh = f_o_shaded_mesh(o_extruded_mesh);

    for(let n = 0; n< n_circles; n+=1){
        let n_nor = n/ n_circles;
        let n_rot_nor = (n_b_nor+0.5+n_nor)%1;
        let o_p = {
            x: Math.sin(n_nor*n_tau)*n_radius_inner,
            y: Math.cos(n_nor*n_tau)*n_radius_inner
        }
        let n_rad_inner = n_radius_tangent_circle-n_thickness;
        let n_rad_outer = n_radius_tangent_circle+n_thickness;
        let n_nor_start1 = n_nor_start+n_rot_nor;
        let n_nor_end1 = n_nor_end+n_rot_nor
        let o_extruded_mesh = f_o_extruded_ring(
            n_rad_inner,
            n_rad_outer,
            n_extrusion,
            n_circle_polygons, 
            n_nor_start1,
            n_nor_end1 
            
        );
        let p1 = {
            x: o_p.x + Math.sin(n_nor_start1*n_tau)*n_radius_tangent_circle,
            y: o_p.y + Math.cos(n_nor_start1*n_tau)*n_radius_tangent_circle,
        }
        let p2 = {
            x: o_p.x + Math.sin(n_nor_end1*n_tau)*n_radius_tangent_circle,
            y: o_p.y + Math.cos(n_nor_end1*n_tau)*n_radius_tangent_circle,
        }
        a_o_mesh.push(
            ...f_a_o_mesh_boxline(
                p1, {x:0,y:0}, n_thickness*2.,n_extrusion
            ),
            ...f_a_o_mesh_boxline(
                p2, {x:0,y:0}, n_thickness*2.,n_extrusion
            )
        )
        let o_mesh = f_o_shaded_mesh(o_extruded_mesh);
        o_mesh.position.set(
            o_p.x, 
            o_p.y, 
            0
        )
        a_o_mesh.push(o_mesh)
    }
    if(b_show_inner){

        a_o_mesh.push(o_mesh);
    }
    return a_o_mesh
}
let f_a_o_mesh_linestar = function(
    n_corners = 5, 
    n_radius_outer = 10, 
    n_radius_inner = 5, 
    n_width = 1, 
    n_z = 1
){
    let a_o_mesh = [];
    let n_tau = Math.PI*2;
    // Start at the first outer point
    let n_its = n_corners*2;

    for (let n_it = 0; n_it < n_its; n_it+=1) {
        let n_it2 = ((n_it+1)%n_its);
        let n_it_nor = n_it / n_its;
        let n_it_nor2 = n_it2 / n_its;
        // Outer point
        let n_ang = n_it_nor * n_tau;
        let n_ang2 = n_it_nor2 * n_tau;

        let n_radius = (n_it % 2 == 0 ) ? n_radius_inner : n_radius_outer;
        let n_radius2 = (n_it2 % 2 == 0 ) ? n_radius_inner : n_radius_outer;
        let o = {
            x: Math.sin(n_ang)*n_radius,
            y: Math.cos(n_ang)*n_radius,
        }
        let o2 = {
            x: Math.sin(n_ang2)*n_radius2,
            y: Math.cos(n_ang2)*n_radius2,
        }
        let od = {
            x: o.x - o2.x, 
            y: o.y - o2.y
        };
        let n_len = Math.sqrt(
            Math.pow(od.x, 2)
            + Math.pow(od.y, 2)
        )
        // const o_geo = new THREE.BoxGeometry( n_len, n_width, n_z ); 
        let a_o_mesh_boxline = f_a_o_mesh_boxline(o, o2, n_width, n_z);
        a_o_mesh.push(
            ...a_o_mesh_boxline
        )
    }

    return a_o_mesh;
}

let f_o_shape_star = function(
    n_corners = 5, 
    n_radius_outer = 10, 
    n_radius_inner = 5, 
) {
    const shape = new THREE.Shape();
    let n_tau = Math.PI*2;
    // Start at the first outer point
    let n_its = n_corners*2;

    for (let n_it = 0; n_it < n_its; n_it+=1) {
        let n_it_nor = n_it / n_its;
        // Outer point
        let n_ang = n_it_nor * n_tau;
        let n_radius = (n_it % 2 == 0 ) ? n_radius_inner : n_radius_outer;
        let o = {
            x: Math.sin(n_ang)*n_radius,
            y: Math.cos(n_ang)*n_radius,
        }
        if(n_it == 0){  
            shape.moveTo(o.x, o.y);
        }else{

            shape.lineTo(
                o.x, 
                o.y
            );
        }
        
    }

    return shape;
}

let f_a_o_mesh_bezierring = function(
    n_its_corner = 3, 
    f_n_radius = ()=>{
        return 10
    },
    n_radius_control_point = 10, 
    n_extrusion_base = 1, 
    n_its_corner_extrusion = 3, 
){
    let a_o_mesh = [];
    for(let n_it_corner = 0; n_it_corner < n_its_corner; n_it_corner+=1){
        let n_it_corner_nor = n_it_corner / n_its_corner;
        let n_it_corner2 = (n_it_corner+1)%n_its_corner;
        let n_it_corner_control = (n_it_corner+.5)%n_its_corner;
        let n_it_corner_nor2 = n_it_corner2/n_its_corner;
        let n_it_corner_nor_control = n_it_corner_control/n_its_corner;
        let n_radius = f_n_radius(
            n_it_corner_nor, 
        );
        let o_p1 = {
            x: Math.sin(n_it_corner_nor*n_tau)*n_radius,
            y: Math.cos(n_it_corner_nor*n_tau)*n_radius,
        }
        // debugger
        let o_p2 = {
            x: Math.sin(n_it_corner_nor2*n_tau)*n_radius,
            y: Math.cos(n_it_corner_nor2*n_tau)*n_radius
        }
        let o_p_control = {
            x: Math.sin(n_it_corner_nor_control*n_tau)*n_radius_control_point,
            y: Math.cos(n_it_corner_nor_control*n_tau)*n_radius_control_point
        }
        a_o_mesh.push(
            ...f_a_o_mesh_cubicbezierboxregpoly(
                o_p1, 
                o_p_control, 
                o_p2, 
                n_extrusion_base,
                n_its_corner_extrusion
            )
        )
    }
    
    return a_o_mesh;

}
let f_a_o_mesh_layered_polygon = function(
    n_its_corner = 3, 
    n_radius = 10, 
    n_thick_base = 1, 
    n_thick_per_layer = 0.4, 
    n_its_layer = 5, 
    n_height_per_layer = 0.2
){
    let n_tau = Math.PI*2.;
    let a_o_mesh = []
    for(let n_it_layer = 0; n_it_layer < n_its_layer; n_it_layer+=1){

        for(let n_it_corner = 0; n_it_corner < n_its_corner; n_it_corner+=1){
            let n_it_corner_nor = n_it_corner / n_its_corner;
            let n_it_corner2 = (n_it_corner+1)%n_its_corner;
            let n_it_corner_nor2 = n_it_corner2/n_its_corner;
            let o_p1 = {
                x: Math.sin(n_it_corner_nor*n_tau)*n_radius,
                y: Math.cos(n_it_corner_nor*n_tau)*n_radius,
            }
            let n_x = Math.sin(n_it_corner_nor2*n_tau)*n_radius;
            let n_y = Math.cos(n_it_corner_nor2*n_tau)*n_radius
            // debugger
            let o_p2 = {
                x: n_x,
                y: n_y//Math.cos(n_it_corner_nor2*n_tau)*n_radius,
            }
            a_o_mesh.push(
                ...f_a_o_mesh_boxline(
                    o_p1, 
                    o_p2, 
                    n_thick_base,
                    n_height_per_layer*n_it_layer
                )
            )
        }

    }
    return a_o_mesh
}
export {
    f_o_shape_star,
    f_o_extruded_ring, 
    f_a_o_mesh_tangent_circles, 
    f_o_shaded_mesh,
    f_a_o_mesh_poi_circle1,
    f_a_o_mesh_poi_circle2,
    f_a_o_mesh_poi_circle3,
    f_a_o_mesh_linestar,
    f_a_o_mesh_layered_polygon, 
    f_a_o_mesh_boxline_layered,
    f_a_o_mesh_boxline, 
    f_a_o_mesh_cubicbezierboxregpoly, 
    f_a_o_mesh_bezierring
}