document.addEventListener("DOMContentLoaded", () => {
// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBYEICMLfbQFyA3m_DcPbOQcIkwjPhSF7w",
  authDomain: "simplyshare-27620.firebaseapp.com",
  projectId: "simplyshare-27620",
  storageBucket: "simplyshare-27620.firebasestorage.app",
  messagingSenderId: "757732600530",
  appId: "1:757732600530:web:56a2ecc34076b9119e1b0b",
  measurementId: "G-S0F6MH1TXX"
};

// Initialize Firebase App
firebase.initializeApp(firebaseConfig);

// Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage(); // ✅ This will now work correctly



  let currentUser = null;
  let isAdmin = false;

  // Monitor user authentication state
  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      isAdmin = user.email === "admin@example.com"; // Replace with your admin email
      updateLoginStatus();
      refreshPostList();
    } else {
      currentUser = null;
      isAdmin = false;
      updateLoginStatus();
    }
  });

  // Update login/logout button states
  function updateLoginStatus() {
    const loginButton = document.getElementById("loginButton");
    const logoutButton = document.getElementById("logoutButton");
    const signupButton = document.getElementById("signupButton");
    const usernameDisplay = document.getElementById("usernameDisplay");

    if (currentUser) {
      usernameDisplay.textContent = `Logged in as: ${currentUser.email}${isAdmin ? " (Admin)" : ""}`;
      loginButton.style.display = "none";
      signupButton.style.display = "none";
      logoutButton.style.display = "inline";
    } else {
      usernameDisplay.textContent = "Not logged in";
      loginButton.style.display = "inline";
      signupButton.style.display = "inline";
      logoutButton.style.display = "none";
    }
  }

  // Tab navigation
  window.showTab = function (tabName) {
    document.querySelectorAll(".tab-content").forEach((tab) => {
      tab.classList.remove("active-tab");
    });
    document.getElementById(tabName).classList.add("active-tab");
  };



document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const themeToggle = document.getElementById("themeToggle"); // Dark mode button

  if (!menuToggle || !navLinks) return; // Prevents errors if elements are missing

  // Toggle menu visibility
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });

  // Ensure clicking outside the menu closes it
  document.addEventListener("click", (event) => {
    if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
      navLinks.classList.remove("show");
    }
  });

  // Dark Mode Toggle (Existing Feature)
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }
});















  

  // Login button handler
  document.getElementById("loginButton").addEventListener("click", async () => {
    const email = prompt("Enter your email:");
    const password = prompt("Enter your password:");

    try {
      await auth.signInWithEmailAndPassword(email, password);
      alert("Login successful!");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });
  // Signup button handler
document.getElementById("signupButton").addEventListener("click", () => {
  window.location.href = "signup.html"; // Redirect to signup page
});


  // Logout button handler
  document.getElementById("logoutButton").addEventListener("click", () => {
    auth.signOut();
  });

  // Handle new post submissions
  document.getElementById("shareForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to post.");
      return;
    }

    const post = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      authorName: document.getElementById("authorName").value,
      category: document.getElementById("category").value,
      contactEmail: document.getElementById("contactEmail").value,
      userId: currentUser.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };

    try {
      await db.collection("posts").add(post);
      alert("Post shared successfully!");
      refreshPostList();
    } catch (error) {
      alert("Error sharing post: " + error.message);
    }
  });

  // Refresh post list from Firestore with filter and duplicate prevention
async function refreshPostList() {
  const postList = document.getElementById("post-list");
  postList.innerHTML = ""; // Clear the list before adding posts

  const selectedCategory = document.getElementById("categoryFilter").value;

  try {
    const querySnapshot = await db.collection("posts").orderBy("timestamp", "desc").get();

    // Store post IDs to prevent duplicates
    const displayedPostIds = new Set();

    querySnapshot.forEach((doc) => {
      const post = doc.data();

      // Prevent duplicates and filter posts
      if (
        !displayedPostIds.has(doc.id) &&
        (selectedCategory === "all" || post.category === selectedCategory)
      ) {
        displayPost(doc.id, post);
        displayedPostIds.add(doc.id);
      }
    });
  } catch (error) {
    console.error("Error refreshing posts:", error.message);
  }
}



  // Display each post with custom icons
function displayPost(postId, post) {
  const postList = document.getElementById("post-list");
  const postItem = document.createElement("div");
  postItem.classList.add("post-item");

  // Post content with icons
  postItem.innerHTML = `
    <h3>${post.title}</h3>
    <p><i class="fas fa-tags"></i> <strong>Category:</strong> ${post.category}</p>
    <p><i class="fas fa-user"></i> <strong>Shared by:</strong> ${post.authorName}</p>
  `;

  // Show post details on click
  postItem.addEventListener("click", () => openPostDetails(post));

  // Add Edit and Delete buttons for post owners and admin
  if (currentUser && (post.userId === currentUser.uid || isAdmin)) {
    const editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editButton.classList.add("edit");
    editButton.addEventListener("click", (e) => {
      e.stopPropagation();
      editPost(postId);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
    deleteButton.classList.add("delete");
    deleteButton.addEventListener("click", async (e) => {
      e.stopPropagation();
      await db.collection("posts").doc(postId).delete();
      refreshPostList();
    });

    postItem.appendChild(editButton);
    postItem.appendChild(deleteButton);
  }

  postList.appendChild(postItem);
}

  // Edit Post Function
function editPost(postId) {
  db.collection("posts").doc(postId).get().then((doc) => {
    if (doc.exists) {
      const post = doc.data();

      // Pre-fill the form with post data
      document.getElementById("title").value = post.title;
      document.getElementById("description").value = post.description;
      document.getElementById("authorName").value = post.authorName;
      document.getElementById("category").value = post.category;
      document.getElementById("contactEmail").value = post.contactEmail;

      // Show the Share tab for editing
      showTab("share");

      // Remove any previous submit handlers to prevent multiple submissions
      const shareForm = document.getElementById("shareForm");
      const newShareForm = shareForm.cloneNode(true);
      shareForm.parentNode.replaceChild(newShareForm, shareForm);

      // Update post on submit
      newShareForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const updatedPost = {
          title: document.getElementById("title").value,
          description: document.getElementById("description").value,
          authorName: document.getElementById("authorName").value,
          category: document.getElementById("category").value,
          contactEmail: document.getElementById("contactEmail").value,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        };

        try {
          await db.collection("posts").doc(postId).update(updatedPost);
          alert("Post updated successfully!");
          refreshPostList();
          showTab("recent-posts");
        } catch (error) {
          alert("Error updating post: " + error.message);
        }
      });
    } else {
      alert("Post not found!");
    }
  });
}



  // Open post details
  function openPostDetails(post) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    let blurredEmail = post.contactEmail.replace(/(.{2})(.*)(?=@)/, (match, a, b) => a + "*".repeat(b.length));

    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-button" onclick="this.parentElement.parentElement.remove()">&times;</span>
        <h2>${post.title}</h2>
        <p><strong>Description:</strong> ${post.description}</p>
        <p><strong>Category:</strong> ${post.category}</p>
        <p><strong>Shared by:</strong> ${post.authorName}</p>
        <p><strong>Contact Email:</strong> <span class="blurred-email">${blurredEmail}</span>
        <button onclick="this.previousElementSibling.textContent='${post.contactEmail}'; this.style.display='none';">View Contact</button></p>
      </div>
    `;

    document.body.appendChild(modal);
  }
  // Category filter event listener
document.getElementById("categoryFilter").addEventListener("change", () => {
  refreshPostList(); // Refresh posts when the selected category changes
});
// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeToggle.innerHTML = document.body.classList.contains("dark-mode")
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
});
// Auto-load posts on page refresh
document.addEventListener("DOMContentLoaded", () => {
  console.log("🔄 Loading recent posts...");
  refreshPostList(); // ✅ Automatically loads posts when the page is loaded
});

// Marketplace product listing connected to Firebase Firestore & Storage
document.getElementById("marketplaceForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) {
    alert("You must be logged in to list a product.");
    return;
  }

  const productName = document.getElementById("productName").value;
  const productDescription = document.getElementById("productDescription").value;
  const productPrice = document.getElementById("productPrice").value;
  const contactDetails = document.getElementById("productContact").value;  // ✅ New contact field
  const productImageFile = document.getElementById("productImage").files[0];

  if (!productImageFile) {
    alert("Please upload a product image.");
    return;
  }

  try {
    const timestamp = Date.now();
    const fileName = `marketplace-images/${timestamp}_${productImageFile.name}`;
    const storageRef = storage.ref(fileName);

    // Upload file
    const uploadTaskSnapshot = await storageRef.put(productImageFile);
    const imageUrl = await uploadTaskSnapshot.ref.getDownloadURL();

    // Save product details to Firestore
    const product = {
      productName,
      productDescription,
      productPrice: parseFloat(productPrice),
      contactDetails,
      imageUrl,
      userId: currentUser.uid,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("marketplace").add(product);

    alert("Product listed successfully!");
    refreshMarketplaceList();
    document.getElementById("marketplaceForm").reset(); // Clear form
  } catch (error) {
    console.error("❌ Error listing product:", error);
    alert("Error listing product: " + error.message);
  }
});

// ✅ Display uploaded products with clickable modal and admin controls
function displayProduct(productId, product) {
  const marketplaceList = document.getElementById("marketplace-list");
  const productItem = document.createElement("div");
  productItem.classList.add("post-item");

  productItem.innerHTML = `
    <img src="${product.imageUrl}" alt="${product.productName}" 
         style="width:100%; height:200px; object-fit:cover; border-radius:8px;" 
         onerror="this.src='fallback-image.png'">
    <h3>${product.productName}</h3>
    <p><strong>Price:</strong> €${product.productPrice.toFixed(2)}</p>
  `;

  // Make product clickable to show details
  productItem.addEventListener("click", () => openProductDetails(productId, product));

  // Add Edit and Delete buttons for the owner or admin
  if (currentUser && (product.userId === currentUser.uid || isAdmin)) {
    const editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editButton.classList.add("edit");
    editButton.addEventListener("click", (e) => {
      e.stopPropagation();
      editProduct(productId);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
    deleteButton.classList.add("delete");
    deleteButton.addEventListener("click", async (e) => {
      e.stopPropagation();
      await db.collection("marketplace").doc(productId).delete();
      refreshMarketplaceList();
    });

    productItem.appendChild(editButton);
    productItem.appendChild(deleteButton);
  }

  marketplaceList.appendChild(productItem);
}

// ✅ Open Product Details Modal with Blurred Contact Details
function openProductDetails(productId, product) {
  const modal = document.createElement("div");
  modal.classList.add("modal");

  // Blur the contact details
  let blurredContact = product.contactDetails.replace(/(.{2})(.*)(?=@)/, (match, firstPart, hiddenPart) => {
    return firstPart + "*".repeat(hiddenPart.length);
  });

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h2>${product.productName}</h2>
      <img src="${product.imageUrl}" alt="${product.productName}" style="width:100%; border-radius:12px;" />
      <p><strong>Description:</strong> ${product.productDescription}</p>
      <p><strong>Price:</strong> €${product.productPrice.toFixed(2)}</p>
      <p><strong>Contact Details:</strong> <span class="blurred-contact">${blurredContact}</span>
      <button onclick="this.previousElementSibling.textContent='${product.contactDetails}'; this.style.display='none';">View Contact</button></p>
    </div>
  `;

  document.body.appendChild(modal);
}


// ✅ Edit Product Function
function editProduct(productId) {
  db.collection("marketplace").doc(productId).get().then((doc) => {
    if (doc.exists) {
      const product = doc.data();

      // Pre-fill the form
      document.getElementById("productName").value = product.productName;
      document.getElementById("productDescription").value = product.productDescription;
      document.getElementById("productPrice").value = product.productPrice;
      document.getElementById("productContact").value = product.contactDetails;

      showTab("marketplace");  // Redirect to marketplace form for editing

      // Remove previous submit handlers
      const marketplaceForm = document.getElementById("marketplaceForm");
      const newMarketplaceForm = marketplaceForm.cloneNode(true);
      marketplaceForm.parentNode.replaceChild(newMarketplaceForm, marketplaceForm);

      // Update product on submit
      newMarketplaceForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const updatedProduct = {
          productName: document.getElementById("productName").value,
          productDescription: document.getElementById("productDescription").value,
          productPrice: parseFloat(document.getElementById("productPrice").value),
          contactDetails: document.getElementById("productContact").value,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        };

        try {
          await db.collection("marketplace").doc(productId).update(updatedProduct);
          alert("Product updated successfully!");
          refreshMarketplaceList();
          showTab("marketplace");
        } catch (error) {
          alert("Error updating product: " + error.message);
        }
      });
    } else {
      alert("Product not found!");
    }
  });
}
// ✅ Define this function at the top to avoid "not defined" errors
async function refreshMarketplaceList() {
  const marketplaceList = document.getElementById("marketplace-list");
  marketplaceList.innerHTML = "";

  try {
    const querySnapshot = await db.collection("marketplace").orderBy("timestamp", "desc").get();

    if (querySnapshot.empty) {
      marketplaceList.innerHTML = "<p>No products listed yet.</p>";
    }

    querySnapshot.forEach((doc) => {
      const product = doc.data();
      displayProduct(doc.id, product);
    });

    console.log("✅ Marketplace refreshed successfully.");
  } catch (error) {
    console.error("❌ Error loading marketplace items:", error);
  }
}

// ✅ Authentication state listener
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    isAdmin = user.email === "admin@example.com"; // Replace with your admin email
    console.log("✅ User authenticated:", user.email);
  } else {
    currentUser = null;
    isAdmin = false;
    console.log("❌ No user logged in.");
  }

  // 🔄 Load marketplace products after checking auth state
  refreshMarketplaceList(); // Make sure this is called AFTER the function definition
});
// ✅ Toggle Marketplace Form (Dropdown)
document.getElementById("toggleMarketplaceForm").addEventListener("click", () => {
  const formContainer = document.getElementById("marketplaceFormContainer");
  formContainer.classList.toggle("show-form");
});

});

