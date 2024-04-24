import tasks = require('azure-pipelines-task-lib/task');
import {ToolRunner} from 'azure-pipelines-task-lib/toolrunner';
import {TerraformAuthorizationCommandInitializer} from './terraform-commands';
import {BaseTerraformCommandHandler} from './base-terraform-command-handler';
import { readFileSync } from 'fs';
const fs = require('fs');

export class TerraformCommandHandlerOCI extends BaseTerraformCommandHandler {
    constructor() {
        super();
        this.providerName = "oci";
    }

    private setupBackend(backendServiceName: string) {
        console.log(backendServiceName);
        this.backendConfig.set('pat', tasks.getInput("backendOCIPAT", true));
        this.backendConfig.set('region', tasks.getEndpointDataParameterRequired(backendServiceName, "region"));
        this.backendConfig.set('user', tasks.getEndpointDataParameterRequired(backendServiceName, "user"));
        this.backendConfig.set('tenancy', tasks.getEndpointDataParameterRequired(backendServiceName, "tenancy"));
        this.backendConfig.set('fingerprint', tasks.getEndpointDataParameterRequired(backendServiceName, "fingerprint"));
        this.backendConfig.set('key', tasks.getEndpointDataParameterRequired(backendServiceName, "key"));
    }

    public async handleBackend(terraformToolRunner: ToolRunner) : Promise<void> {
        let backendServiceName = tasks.getInput("backendServiceOCI", true);
        this.setupBackend(backendServiceName);

        for (let [key, value] of this.backendConfig.entries()) {
            terraformToolRunner.arg(`-backend-config=${key}=${value}`);
        }
    }

    public async handleProvider(command: TerraformAuthorizationCommandInitializer) : Promise<void> {
        console.log("key" + tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "key", false));
        console.log("user" + tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "user", false));
        console.log("tenancy" + tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "tenancy", false));
        console.log("fingerprint=" + tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "fingerprint", false));
        console.log("region=" + tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "region", false));

        if (command.serviceProvidername) {
            fs.writeFile('./key.pem', tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "key", false),  function(err) {
                if (err) {
                    return console.error(err);
                }
                console.log("key.pem created");
            });

            process.env['TF_VAR_user_ocid']  = tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "user", false);
            process.env['TF_VAR_tenancy_ocid']  = tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "tenancy", false);        
            process.env['TF_VAR_fingerprint']  = tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "fingerprint", false);
            process.env['TF_VAR_private_key_path']  =  "./key.pem";      
            process.env['TF_VAR_region']  = tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "region", false);  
        }
    }
}