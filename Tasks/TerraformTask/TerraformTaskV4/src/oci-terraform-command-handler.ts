import tasks = require('azure-pipelines-task-lib/task');
import {ToolRunner} from 'azure-pipelines-task-lib/toolrunner';
import {TerraformAuthorizationCommandInitializer} from './terraform-commands';
import {BaseTerraformCommandHandler} from './base-terraform-command-handler';
const fs = require('fs');

export class TerraformCommandHandlerOCI extends BaseTerraformCommandHandler {
    constructor() {
        super();
        this.providerName = "oci";
    }

    private setupBackend(backendServiceName: string) {
        tasks.debug("setupBackend -- does nothing ...");
    }

    public async handleBackend(terraformToolRunner: ToolRunner) : Promise<void> {
        tasks.debug("handleBackend -- does nothing ...");
        let backendServiceName = tasks.getInput("backendServiceOCI", true);
        this.setupBackend(backendServiceName);

        for (let [key, value] of this.backendConfig.entries()) {
            terraformToolRunner.arg(`-backend-config=${key}=${value}`);
        }
    }

    public async handleProvider(command: TerraformAuthorizationCommandInitializer) : Promise<void> {
        tasks.debug("key" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "key"));
        tasks.debug("user" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "user"));
        tasks.debug("tenancy" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "tenancy"));
        tasks.debug("fingerprint=" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "fingerprint"));
        tasks.debug("region=" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "region"));

        if (command.serviceProvidername) {
            fs.writeFile('/home/opc/.oci/oci_api_key.pem', tasks.getEndpointAuthorizationParameter(command.serviceProvidername, "key", false),  function(err) {
                if (err) {
                    return console.error(err);
                }
                tasks.debug("/.oci/oci_api_key.pem created");
            });

            var data = "[DEFAULT]\n";
            data = data + "tenancy=" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "tenancy") + "\n";
            data = data + "user=" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "user") + "\n";
            data = data + "fingerprint=" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "fingerprint") + "\n";
            data = data + "region=" + tasks.getEndpointDataParameterRequired(command.serviceProvidername, "region") + "\n";
            data = data + "key_file=/home/opc/.oci/oci_api_key.pem\n";
            data = "\n";

            fs.writeFile('/home/opc/.oci/config', data,  function(err) {
                if (err) {
                    return console.error(err);
                }
                console.log("/.oci/config created");
            }); 
        }
    }
}