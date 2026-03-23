import bcrypt from "bcryptjs";

const hash = await bcrypt.hash("useriscool", 12);
console.log(hash);
/*
 $results = Get-ChildItem -Recurse -Include *.js, *.jsx  |
    Where-Object { $_.FullName -notmatch "node_modules" } |
    ForEach-Object {
        $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
        [PSCustomObject]@{
            File  = $_.FullName
            Lines = $lines
        }
    }

$results | Format-Table

"Total lines: $($results.Lines | Measure-Object -Sum | Select-Object -ExpandProperty Sum)"
*/
//use it to work out the number of lines in  the project 