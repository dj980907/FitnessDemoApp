document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('workout-form');
    const workoutsContainer = document.getElementById('workouts');

    // Fetch today's workouts on page load
    fetchTodaysWorkouts();

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const category = document.getElementById('category').value;
        const workoutName = document.getElementById('workoutName').value;
        const sets = document.getElementById('sets').value;
        const reps = document.getElementById('reps').value;
        const weight = document.getElementById('weight').value;

        const workoutCard = `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="mr-3">
                            <img src="https://via.placeholder.com/50" alt="Workout Icon" class="img-fluid">
                        </div>
                        <div>
                            <h5 class="card-title">${workoutName}</h5>
                            <p class="card-text">${category}</p>
                            <p class="card-text">${sets} sets x ${reps} reps @ ${weight} kg</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        workoutsContainer.insertAdjacentHTML('beforeend', workoutCard);

        // Optionally, clear the form fields
        form.reset();
    });
});

function fetchTodaysWorkouts() {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    fetch(`/diary/${today}`)
        .then(response => response.json())
        .then(data => {
            workoutsContainer.innerHTML = '';
            if (data.workouts.length > 0) {
                data.workouts.forEach(workout => {
                    const workoutCard = `
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="d-flex align-items-center">
                                    <div class="mr-3">
                                        <img src="https://via.placeholder.com/50" alt="Workout Icon" class="img-fluid">
                                    </div>
                                    <div>
                                        <h5 class="card-title">${workout.workoutName}</h5>
                                        <p class="card-text">${workout.category}</p>
                                        <p class="card-text">${workout.sets} sets x ${workout.reps} reps @ ${workout.weight} kg</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    workoutsContainer.insertAdjacentHTML('beforeend', workoutCard);
                });
            } else {
                workoutsContainer.innerHTML = '<p>No workouts for today.</p>';
            }
        })
        .catch(error => console.error('Error fetching workouts:', error));
}