# duration-picker

copy `bootstrap-duration-picker.css` and `bootstrap-duration-picker.js` files to your project.

## Dependencies

- jQuery 1.*
- Bootstrap 3.* (for styling only)

## Usage

```js
$('.duration-picker').durationPicker();

// or

$('.duration-picker').durationPicker({
    
    // optional object with translations (English is used by default)
    translations: {
        day: 'dia',
        hour: 'hora',
        minute: 'minuto',
        second: 'segundo',
        days: 'dias',
        hours: 'horas',
        minutes: 'minutos',
        seconds: 'segundos',
    },

    // defines whether to show seconds or not
    showSeconds: false,

    // defines whether to show days or not
    showDays: true,

    // callback function that is passed value in seconds every time duration is changed
    onChanged: function (value) {
        console.log(value);
    }
});
```

## Public methods

<table>
  <tr>
    <th>Method</th>
    <th>Example</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><b>setValue</b></td>
    <td><code>$('#selector').data('durationPicker').setValue(0);</code></td>
    <td>Allows to reinitialize duration picker value after it's been created. Accepts new number of seconds</td>
  </tr>  
</table>

