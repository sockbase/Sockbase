if (typeof document !== 'undefined') {
  (function () {
    var style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = `
      .sb_button {
        background-color: #b14963;
        border: none;
        color: white;
        padding: 5px 10px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        border-radius: 5px;
        transition: background-color 0.2s;
        cursor: pointer;
      }
      .sb_button:hover {
        background-color: #d16f8f;
      }
      .sb_button:active {
        background-color: #b14963;
      }
      .sb_button::before {
        display: inline-block;
        content: '';
        width: 24px;
        height: 24px;
        vertical-align: text-top;
        margin-right: 5px;
        background-image: url('data:image/svg+xml,<%3Fxml version="1.0" encoding="UTF-8"%3F><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><style> .cls-1 { fill: %23fff; } </style></defs><path class="cls-1" d="M463.3,181.81l19.83-102.1H68.49L0,432.29h512l-48.7-250.48ZM375.46,389.9H55.65L107.67,122.1h319.81l-52.02,267.8Z"/></svg>');
      }
    `
    document.head.appendChild(style)
  })()
}
