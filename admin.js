import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAMCJgfC_lox-EIEelRRh-7VjriZ7dftP0",
  authDomain: "myalbumproject-dca7f.firebaseapp.com",
  projectId: "myalbumproject-dca7f",
  storageBucket: "myalbumproject-dca7f.appspot.com",
  messagingSenderId: "685476424363",
  appId: "1:685476424363:web:b6c91eb7d57e37d60d65ee"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Category to Subcategory mapping
const subcategories = {
  events: ["Stage", "Enterence", "Pathway", "Cheddar", "NameBoard"],
  catering: ["FoodCorner", "JuiceCorner", "Dishes", "Drinks"],
  special: ["Mehandi", "Haldi", "BrideToBe", "Birthday"],
  more: ["Paperblast", "Coldpyro", "DryIce", "Sound", "Light"]
};

// Show Tabs
window.showTab = function(tabName) {
  document.querySelectorAll('.tabContent').forEach(tab => tab.style.display = 'none');
  document.getElementById(tabName).style.display = 'block';
}
showTab('addProduct'); // Default

// Update Subcategory when Category changes
window.updateSubcategories = function() {
  const category = document.getElementById('category').value;
  const subcategorySelect = document.getElementById('subcategory');
  subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
  
  if (subcategories[category]) {
    subcategories[category].forEach(sub => {
      const option = document.createElement('option');
      option.value = sub;
      option.textContent = sub;
      subcategorySelect.appendChild(option);
    });
  }
}

// Add Product
window.addProduct = async function() {
  const productName = document.getElementById('productName').value.trim();
  const category = document.getElementById('category').value.trim();
  const subcategory = document.getElementById('subcategory').value.trim();
  const rate = document.getElementById('rate').value.trim();
  const productImage = document.getElementById('productImage').files[0];

  if (!productName || !category || !subcategory || !rate || !productImage) {
    alert("Please fill all fields!");
    return;
  }

  try {
    // Upload image to Cloudinary
    const formData = new FormData();
    formData.append('file', productImage);
    formData.append('upload_preset', 'Imageuploader');

    const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dmx3gppso/image/upload', {
      method: 'POST',
      body: formData
    });
    const cloudinaryData = await cloudinaryResponse.json();
    const imageUrl = cloudinaryData.secure_url;

    // Save to Firestore
    await addDoc(collection(db, 'products'), {
      productName,
      category,
      subcategory,
      rate,
      imageUrl
    });

    alert("Product added successfully!");
    document.getElementById('productName').value = '';
    document.getElementById('category').value = '';
    document.getElementById('subcategory').innerHTML = '<option value="">Select Subcategory</option>';
    document.getElementById('rate').value = '';
    document.getElementById('productImage').value = '';
  } catch (error) {
    console.error(error);
    alert("Failed to add product!");
  }
}

// Load Products
async function loadProducts() {
  const productsList = document.getElementById('productsList');
  productsList.innerHTML = '';
  const querySnapshot = await getDocs(collection(db, 'products'));
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const productHTML = `
      <div class="product-item">
        <img src="${data.imageUrl}" alt="Product">
        <h3>${data.productName}</h3>
        <p><b>Category:</b> ${data.category}</p>
        <p><b>Subcategory:</b> ${data.subcategory}</p>
        <p><b>Rate:</b> ₹${data.rate}</p>
        <button class="edit-btn" onclick="editProduct('${docSnap.id}', '${data.productName}', '${data.category}', '${data.subcategory}', '${data.rate}')">Edit</button>
        <button onclick="deleteProduct('${docSnap.id}')">Delete</button>
      </div>
    `;
    productsList.innerHTML += productHTML;
  });
}

window.editProduct = async function(id, oldName, oldCategory, oldSubcategory, oldRate) {
  const newName = prompt("Edit Product Name", oldName);
  const newCategory = prompt("Edit Category", oldCategory);
  const newSubcategory = prompt("Edit Subcategory", oldSubcategory);
  const newRate = prompt("Edit Rate", oldRate);

  if (newName && newCategory && newSubcategory && newRate) {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      productName: newName,
      category: newCategory,
      subcategory: newSubcategory,
      rate: newRate
    });
    alert("Product updated!");
    loadProducts();
  }
}

window.deleteProduct = async function(id) {
  if (confirm("Are you sure you want to delete this product?")) {
    await deleteDoc(doc(db, 'products', id));
    alert("Product deleted!");
    loadProducts();
  }
}

document.querySelector("nav button:nth-child(2)").addEventListener("click", loadProducts);
