param(
    [Parameter(Mandatory = $true)][string]$InputPath,
    [Parameter(Mandatory = $true)][string]$OutputPath
)

$ErrorActionPreference = 'Stop'

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
Copy-Item -LiteralPath $resolvedInput -Destination $OutputPath -Force

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open($OutputPath, [System.IO.Compression.ZipArchiveMode]::Update)

try {
    $entry = $archive.GetEntry('word/document.xml')
    if ($null -eq $entry) {
        throw 'word/document.xml was not found in the DOCX package.'
    }

    $reader = [System.IO.StreamReader]::new($entry.Open())
    try {
        $xml = $reader.ReadToEnd()
    }
    finally {
        $reader.Dispose()
    }

    $tablePattern = [regex]::new('<w:tbl>.*?</w:tbl>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $gridPattern = [regex]::new('<w:tblGrid>.*?</w:tblGrid>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $rowPattern = [regex]::new('<w:tr>.*?</w:tr>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
    $widthPattern = [regex]::new('<w:tcW\s+w:type="dxa"\s+w:w="(\d+)"\s*/>')
    $script:patchedCount = 0

    $patchedXml = $tablePattern.Replace($xml, {
        param($tableMatch)

        $tableXml = $tableMatch.Value
        $firstRow = $rowPattern.Match($tableXml)
        if (-not $firstRow.Success) {
            return $tableXml
        }

        $widthMatches = $widthPattern.Matches($firstRow.Value)
        if ($widthMatches.Count -eq 0) {
            return $tableXml
        }

        $gridColumns = foreach ($widthMatch in $widthMatches) {
            '<w:gridCol w:w="' + $widthMatch.Groups[1].Value + '"/>'
        }
        $newGrid = '<w:tblGrid>' + ($gridColumns -join '') + '</w:tblGrid>'

        if ($gridPattern.IsMatch($tableXml)) {
            $script:patchedCount += 1
            return $gridPattern.Replace($tableXml, $newGrid, 1)
        }

        return $tableXml
    })

    $entry.Delete()
    $newEntry = $archive.CreateEntry('word/document.xml', [System.IO.Compression.CompressionLevel]::Optimal)
    $writer = [System.IO.StreamWriter]::new($newEntry.Open(), [System.Text.UTF8Encoding]::new($false))
    try {
        $writer.Write($patchedXml)
    }
    finally {
        $writer.Dispose()
    }
}
finally {
    $archive.Dispose()
}

Write-Output "Patched table grids: $script:patchedCount"
