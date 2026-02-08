# Stress Testing Report - AWS EC2 t3.micro

Date: 08/02/2026
Tool: K6
Result: 13,000 requests in 3.5 minutes, no errors.

  █ TOTAL RESULTS

    checks_total.......: 27482  130.124367/s
    checks_succeeded...: 99.89% 27454 out of 27482
    checks_failed......: 0.10%  28 out of 27482

    ✓ status is 200
    ✗ tiempo respuesta < 500ms
      ↳  99% — ✓ 13713 / ✗ 28

    HTTP
    http_req_duration..............: avg=212.68ms min=176.1ms med=198.85ms max=1.12s p(90)=251.38ms p(95)=279.59ms
      { expected_response:true }...: avg=212.68ms min=176.1ms med=198.85ms max=1.12s p(90)=251.38ms p(95)=279.59ms
    http_req_failed................: 0.00%  0 out of 13741
    http_reqs......................: 13741  65.062183/s

    EXECUTION
    iteration_duration.............: avg=1.21s    min=1.17s   med=1.2s     max=2.12s p(90)=1.25s    p(95)=1.29s
    iterations.....................: 13741  65.062183/s
    vus............................: 1      min=1          max=199  
    vus_max........................: 200    min=200        max=200  

    NETWORK
    data_received..................: 5.9 MB 28 kB/s
    data_sent......................: 4.4 MB 21 kB/s



                                                                    
running (3m31.2s), 000/200 VUs, 13741 complete and 0 interrupted iterations                                                             
default ✓ [====================================] 000/200 VUs  3m30s