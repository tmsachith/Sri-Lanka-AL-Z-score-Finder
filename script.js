if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    API_URL = 'https://sri-lanka-al-z-score-finder.vercel.app'; // Your Vercel-deployed backend URL
  }else{
    API_URL = 'http://localhost:3000' // Default to localhost for development
  }

document.addEventListener('DOMContentLoaded', function() {
    fetchYears();
});

let coursesData = {};

function showLoader(id) {
    document.getElementById(id).style.display = 'block';
}

function hideLoader(id) {
    document.getElementById(id).style.display = 'none';
}

function fetchYears() {
    showLoader('yearLoader');
    fetch(`${API_URL}/years`)
        .then(response => response.json())
        .then(years => {
            const yearSelect = document.getElementById('year');
            years.forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });
            hideLoader('yearLoader');
        })
        .catch(error => {
            console.error('Error fetching years:', error);
            hideLoader('yearLoader');
        });
}

function populateDistricts(year) {
    showLoader('districtLoader');
    fetch(`${API_URL}/districts/${year}`)
        .then(response => response.json())
        .then(districts => {
            const districtSelect = document.getElementById('district');
            districtSelect.innerHTML = '<option value="">Select District</option>';
            districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                districtSelect.appendChild(option);
            });
            hideLoader('districtLoader');
        })
        .catch(error => {
            console.error('Error fetching districts:', error);
            hideLoader('districtLoader');
        });
}

function populateCourses(year, district) {
    showLoader('courseLoader');
    fetch(`${API_URL}/courses/${year}/${district}`)
        .then(response => response.json())
        .then(courses => {
            coursesData = courses;
            const courseSelect = document.getElementById('course');
            courseSelect.innerHTML = '<option value="">Select Course</option>';
            Object.keys(courses).forEach(course => {
                const option = document.createElement('option');
                option.value = course;
                option.textContent = course;
                courseSelect.appendChild(option);
            });
            hideLoader('courseLoader');
        })
        .catch(error => {
            console.error('Error fetching courses:', error);
            hideLoader('courseLoader');
        });
}

function displayZScore(course) {
    const zScore = coursesData[course];
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = `Z-Score: ${zScore}`;
    resultDiv.style.display = 'block';
}

document.getElementById('year').addEventListener('change', function() {
    const selectedYear = this.value;
    if (selectedYear) {
        populateDistricts(selectedYear);
    } else {
        document.getElementById('district').innerHTML = '<option value="">Select District</option>';
    }
    document.getElementById('course').innerHTML = '<option value="">Select Course</option>';
    document.getElementById('result').style.display = 'none';
    coursesData = {};
});

document.getElementById('district').addEventListener('change', function() {
    const selectedYear = document.getElementById('year').value;
    const selectedDistrict = this.value;
    if (selectedYear && selectedDistrict) {
        populateCourses(selectedYear, selectedDistrict);
    } else {
        document.getElementById('course').innerHTML = '<option value="">Select Course</option>';
    }
    document.getElementById('result').style.display = 'none';
    coursesData = {};
});

document.getElementById('course').addEventListener('change', function() {
    const selectedCourse = this.value;
    if (selectedCourse) {
        displayZScore(selectedCourse);
    } else {
        document.getElementById('result').style.display = 'none';
    }
});