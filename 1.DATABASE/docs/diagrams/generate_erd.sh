#!/bin/bash
echo "Generating ERD diagrams..."
plantuml -tpng DATABASE_ERD.puml
plantuml -tsvg DATABASE_ERD.puml  
echo "Diagrams generated successfully!"
ls -lh DATABASE_ERD.{png,svg} 2>/dev/null || echo "Waiting for files..."
