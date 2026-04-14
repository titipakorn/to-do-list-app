<script>
  let { data } = $props();
</script>

<div class="container">
  <h1>Todo App</h1>

  <form method="POST" action="?/create" class="input-group">
    <input
      type="text"
      name="title"
      placeholder="Add a new todo..."
      required
    />
    <button type="submit">Add</button>
  </form>

  {#if data.todos.length === 0}
    <p class="empty-message">No todos yet. Add one to get started!</p>
  {:else}
    <ul class="todos-list">
      {#each data.todos as todo (todo.id)}
        <li class="todo-item {todo.completed ? 'completed' : ''}">
          <form method="POST" action="?/toggle" class="toggle-form">
            <input type="hidden" name="id" value={todo.id} />
            <button type="submit" class="toggle-btn" title="Toggle completion">✓</button>
          </form>
          <span class="todo-title">{todo.title}</span>
          <form method="POST" action="?/delete" class="delete-form">
            <input type="hidden" name="id" value={todo.id} />
            <button type="submit" class="delete-btn" title="Delete todo">✗</button>
          </form>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, sans-serif;
    background: #f5f5f5;
    margin: 0;
    padding: 0;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
  }

  .input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
  }

  input[type='text'] {
    flex: 1;
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 4px;
    font-size: 16px;
    transition: border-color 0.3s;
  }

  input[type='text']:focus {
    outline: none;
    border-color: #4caf50;
  }

  button[type='submit'] {
    padding: 12px 24px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
  }

  button[type='submit']:hover {
    background: #45a049;
  }

  .empty-message {
    text-align: center;
    color: #999;
    margin: 60px 0;
    font-size: 16px;
  }

  .todos-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .todo-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px;
    background: white;
    border-radius: 4px;
    margin-bottom: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: opacity 0.3s;
  }

  .todo-item.completed {
    opacity: 0.6;
  }

  .toggle-form {
    display: contents;
  }

  .toggle-btn {
    padding: 6px 12px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.3s;
    flex-shrink: 0;
  }

  .toggle-btn:hover {
    background: #45a049;
  }

  .todo-title {
    flex: 1;
    font-size: 16px;
    color: #333;
    word-break: break-word;
  }

  .todo-item.completed .todo-title {
    text-decoration: line-through;
    color: #999;
  }

  .delete-form {
    display: contents;
  }

  .delete-btn {
    padding: 6px 12px;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.3s;
    flex-shrink: 0;
  }

  .delete-btn:hover {
    background: #da190b;
  }
</style>
