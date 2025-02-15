# Security

## Reporting a Security Issue
If you discover any security vulnerabilities in SaleCheck, please report them directly to us. We take security seriously and will do our best to resolve the issue as quickly as possible.

To report a security vulnerability:
- Email: security@sale-check.com
- Subject line: "Security Vulnerability Report: \[brief description\]"
  
Once we receive your report, we will acknowledge it within 5 business days and keep you informed on the progress toward a fix. Depending on the severity of the issue, we may ask for further details or clarification.

## Disclosure Policy
SaleCheck follows a responsible disclosure process to ensure that any vulnerabilities are handled appropriately and that necessary fixes are deployed before the issue becomes public.
- **Security report received**: A primary handler will be assigned to investigate and verify the vulnerability. All supported versions of the application will be checked for impact.
- **Fixes prepared**: Once the issue is confirmed, we will prepare a fix for all affected versions. The fix will be held privately until an official announcement.
- **CVE and embargo**: If applicable, a CVE (Common Vulnerability and Exposure) will be requested. The vulnerability's disclosure will be coordinated with an embargo date.
- **Public disclosure**: On the embargo date, we will notify affected users and publish a detailed security advisory. We may also release updates to the public repository, as necessary.

## Third-party Libraries
SaleCheck uses several third-party libraries and services, such as Firebase and Google Cloud Functions. If you discover a vulnerability in any third-party module, we recommend reporting it directly to the respective maintainers of that module.

## Threat Model
SaleCheck relies on Firebase and Google Cloud for secure handling of user data, and the web application is hosted on Firebase Hosting. As such, vulnerabilities affecting these underlying systems are outside of the scope of SaleCheck’s responsibility.

However, vulnerabilities within our platform are considered a priority and we ask that any security issues impacting SaleCheck's functionality or its handling of user data be reported according to the guidelines above.

### Types of Issues Considered Vulnerabilities
- **Data Exposure**: Unauthorized access to user data such as product URLs or target prices.
- **Integrity and Confidentiality**: If the system fails to properly encrypt sensitive data.
- **Denial of Service (DoS)**: Exploiting the system to cause unavailability or degradation of service.

### Non-Vulnerabilities
- **Malicious User Input**: Any issues related to malformed data input or malicious third-party modules should be handled within your application layer.
- **Incorrect Configurations**: Vulnerabilities arising from misconfigured systems or incorrect deployment practices are not considered vulnerabilities in SaleCheck itself.
- **Third-party APIs**: Vulnerabilities in third-party services like Firebase, Google Cloud, or other APIs used by the application are not part of this policy.

## Receiving Security Updates
We distribute important security updates and notifications through the following channels:
- [SaleCheck GitHub repository](https://github.com/MathiasSchindlerCPH/sale-check)
- Email alerts for registered users

## How You Can Help
If you identify any areas for improvement or have suggestions regarding our security processes, feel free to submit an issue in the [SaleCheck GitHub repository](https://github.com/MathiasSchindlerCPH/sale-check/issues).
