const Role = require("../models/Role");


exports.createRole = async (req, res) => {
    try {
        const { name, description, accessRights } = req.body;

        const user = req?.user;

        if (user?.role !== 'SUPER_ADMIN') {
            return res.status(404).json({ error: true, message: 'You are not allowed to create role', });
        }

        if (!name) {
            return res.status(400).json({ error: true, message: "Role name is required" });
        }

        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(409).json({ error: true, message: "Role already exists" });
        }

        // Create Role
        const newRole = await Role.create({
            name,
            description,
            accessRights,
            isActive: true,
        });

        return res.status(201).json({
            error: false,
            message: "Role created successfully",
            data: newRole
        });

    } catch (error) {
        console.error("Create Role Error:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};


exports.getRole = async (req, res) => {
    try {
        console.log('hit')
        const roles = await Role.find({ isActive: true }).sort({ createdAt: -1 });

        return res.status(200).json({
            error: false,
            message: "Roles fetched successfully",
            data: roles
        });

    } catch (error) {
        console.error("Create Role Error:", error);
        return res.status(500).json({ error: true, message: "Server Error" });
    }
};