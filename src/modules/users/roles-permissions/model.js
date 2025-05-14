import mongoose from 'mongoose';

const { Schema } = mongoose;

const permissionSchema = new Schema({
    resource: {
        type: String,
        required: true
    },
    actions: [{
        type: String,
        required: true
    }]
});

const roleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    permissions: [permissionSchema]
});

const RoleModel = mongoose.model('Roles', roleSchema);

export default RoleModel;
