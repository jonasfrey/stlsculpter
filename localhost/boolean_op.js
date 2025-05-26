function(){
    // Create two meshes
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const sphereGeometry = new THREE.SphereGeometry(0.6, 32, 32);

    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.x = 0.5;
    sphereMesh.updateMatrix(); // This is crucial!


    // Position the sphere inside the box
    sphereMesh.position.set(0.5, 0.5, 0.5);

    // Convert meshes to CSG
    const boxCSG = o_mod_csg.CSG.fromMesh(boxMesh);
    const sphereCSG = o_mod_csg.CSG.fromMesh(sphereMesh);

    // Perform Boolean operations
    const unionResult = boxCSG.union(sphereCSG);        // Combine
    const subtractResult = boxCSG.subtract(sphereCSG);  // Subtract
    const intersectResult = boxCSG.intersect(sphereCSG); // Intersection

    // Convert back to a Three.js mesh
    const resultMesh = o_mod_csg.CSG.toMesh(subtractResult, boxMesh.matrix, boxMaterial);


    const boxCSG2 = o_mod_csg.CSG.fromMesh(boxMesh);

    // scene.add(resultMesh);
return [resultMesh]
}
