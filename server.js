const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODBURI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

// Define the schema and model
const itemSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    count: { type: Number, required: true },
    price: { type: Number, required: true },
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);
app.get('/',(req,res)=>{
   res.sendFile(__dirname+'/public/index.html')
})
// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Item.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single product by name
app.get('/api/products/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            throw new Error('No name given');
        }
        const product = await Item.findOne({ name });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Add a new product
app.post('/api/products', async (req, res) => {
    try {
        const { name, count, price } = req.body;
        if (!name || !count || !price) {
            throw new Error('Name, count, and price are required');
        }
        const product = new Item({ name, count, price });
        await product.save();
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a product by ID
app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Item.findByIdAndDelete(id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
app.patch('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { delta } = req.body;
        if (typeof delta !== 'number') {
            return res.status(400).json({ message: 'Delta must be a number' });
        }

        const product = await Item.findByIdAndUpdate(id, { $inc: { count: delta } }, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product count updated successfully', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Start the server
const PORT = process.env.PORT || 6969;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
